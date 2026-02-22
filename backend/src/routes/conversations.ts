import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { generateText } from 'ai';
import { gateway } from '@specific-dev/framework';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface CreateConversationBody {
  country: string;
  topic?: string;
}

interface GetConversationMessagesParams {
  id: string;
}

interface PostMessageBody {
  message: string;
}

export function register(app: App, fastify: FastifyInstance) {
  // POST /api/conversations - Create a new conversation
  fastify.post<{ Body: CreateConversationBody }>(
    '/api/conversations',
    {
      schema: {
        description: 'Create a new conversation',
        tags: ['conversations'],
        body: {
          type: 'object',
          required: ['country'],
          properties: {
            country: { type: 'string' },
            topic: { type: 'string' },
          },
        },
        response: {
          201: {
            description: 'Conversation created successfully',
            type: 'object',
            properties: {
              conversationId: { type: 'string', format: 'uuid' },
              country: { type: 'string' },
              topic: { type: ['string', 'null'] },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          400: {
            type: 'object',
            properties: { error: { type: 'string' } },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateConversationBody }>, reply: FastifyReply) => {
      const { country, topic } = request.body;
      app.logger.info({ country, topic }, 'Creating new conversation');

      try {
        const result = await app.db
          .insert(schema.conversations)
          .values({
            country,
            topic: topic || null,
          })
          .returning();

        const conversation = result[0];
        app.logger.info({ conversationId: conversation.id }, 'Conversation created successfully');

        reply.status(201);
        return {
          conversationId: conversation.id,
          country: conversation.country,
          topic: conversation.topic,
          createdAt: conversation.createdAt.toISOString(),
        };
      } catch (error) {
        app.logger.error({ err: error, country, topic }, 'Failed to create conversation');
        throw error;
      }
    }
  );

  // GET /api/conversations - Get all conversations
  fastify.get(
    '/api/conversations',
    {
      schema: {
        description: 'Get all conversations',
        tags: ['conversations'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                conversationId: { type: 'string', format: 'uuid' },
                country: { type: 'string' },
                topic: { type: ['string', 'null'] },
                lastMessageAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async () => {
      app.logger.info('Fetching all conversations');

      try {
        const result = await app.db
          .select()
          .from(schema.conversations)
          .orderBy(desc(schema.conversations.lastMessageAt));

        app.logger.info({ count: result.length }, 'Conversations retrieved successfully');

        return result.map((conv) => ({
          conversationId: conv.id,
          country: conv.country,
          topic: conv.topic,
          lastMessageAt: conv.lastMessageAt.toISOString(),
          createdAt: conv.createdAt.toISOString(),
        }));
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch conversations');
        throw error;
      }
    }
  );

  // GET /api/conversations/:id/messages - Get all messages for a conversation
  fastify.get<{ Params: GetConversationMessagesParams }>(
    '/api/conversations/:id/messages',
    {
      schema: {
        description: 'Get all messages for a conversation',
        tags: ['conversations'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Conversation ID' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                role: { type: 'string' },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          404: {
            type: 'object',
            properties: { error: { type: 'string' } },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GetConversationMessagesParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      app.logger.info({ conversationId: id }, 'Fetching messages for conversation');

      try {
        // Check if conversation exists
        const conversations = await app.db
          .select()
          .from(schema.conversations)
          .where(eq(schema.conversations.id, id));

        if (conversations.length === 0) {
          app.logger.warn({ conversationId: id }, 'Conversation not found');
          return reply.status(404).send({ error: 'Conversation not found' });
        }

        const result = await app.db
          .select()
          .from(schema.messages)
          .where(eq(schema.messages.conversationId, id))
          .orderBy(schema.messages.createdAt);

        app.logger.info({ conversationId: id, count: result.length }, 'Messages retrieved successfully');

        return result.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        }));
      } catch (error) {
        app.logger.error({ err: error, conversationId: id }, 'Failed to fetch messages');
        throw error;
      }
    }
  );

  // POST /api/conversations/:id/messages - Save user message and get AI response
  fastify.post<{ Params: GetConversationMessagesParams; Body: PostMessageBody }>(
    '/api/conversations/:id/messages',
    {
      schema: {
        description: 'Save a user message and get AI response',
        tags: ['conversations'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Conversation ID' },
          },
        },
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Message processed and AI response returned',
            type: 'object',
            properties: {
              response: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: { error: { type: 'string' } },
          },
          500: {
            type: 'object',
            properties: { error: { type: 'string' } },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: GetConversationMessagesParams; Body: PostMessageBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { message } = request.body;
      app.logger.info({ conversationId: id, messageLength: message.length }, 'Processing user message');

      try {
        // Check if conversation exists
        const conversations = await app.db
          .select()
          .from(schema.conversations)
          .where(eq(schema.conversations.id, id));

        if (conversations.length === 0) {
          app.logger.warn({ conversationId: id }, 'Conversation not found');
          return reply.status(404).send({ error: 'Conversation not found' });
        }

        // Save user message
        const userMessage = await app.db.insert(schema.messages).values({
          conversationId: id,
          role: 'user',
          content: message,
        }).returning();

        app.logger.info({ conversationId: id }, 'User message saved');

        // Get conversation history
        const messageHistory = await app.db
          .select()
          .from(schema.messages)
          .where(eq(schema.messages.conversationId, id))
          .orderBy(schema.messages.createdAt);

        // Prepare messages for AI with proper typing
        const messagesForAI = messageHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // System prompt
        const systemPrompt = `You are an AI assistant embedded in an app that helps users preview what daily life is like when moving to another country.

The app is pay once, use forever. There are no subscriptions, no upgrades, and no recurring payments. Do not mention subscriptions or recurring access under any circumstance.

🎯 Core Mission
Your role is to provide a neutral, realistic, lifestyle-focused preview of living in a different country.

You do not:
- give legal advice
- give immigration advice
- give tax advice
- give salary or financial advice
- tell users what decision to make

You only explain lived experience and common realities. Your goal is to calibrate expectations, reduce idealization, and help users think clearly.

🧭 Scope of Information (Allowed)
You may describe:
- Daily life pace and routines
- Social norms and culture
- Bureaucracy and efficiency (qualitative only)
- Work culture (no salaries, no visas)
- Language and communication challenges
- Weather and seasonal reality
- Convenience, reliability, and comfort
- Common surprises reported by expats
- Who typically enjoys living there
- Who often struggles living there

All information must be: General, Non-binding, Experience-based, Clearly framed as typical, not guaranteed

🚫 Strictly Forbidden
You must NOT:
- recommend moving or not moving
- predict outcomes
- promise happiness, success, or savings
- estimate income, taxes, or costs
- give legal, immigration, or medical guidance
- use absolute language (always, never)

If a user asks for advice outside scope, respond calmly: 'I can't advise on that, but I can explain what daily life is typically like so you can decide for yourself.'

🗣️ Tone & Style
Calm, Honest, Balanced, Slightly conservative (avoid romanticizing), Respectful, Human

Write as if you are: 'A thoughtful friend who has lived there and wants to be honest.'
Avoid hype. Avoid emojis. Avoid sales language.

🧩 Response Structure (Default)
When generating a lifestyle preview, structure responses like this:

Quick Reality Snapshot
A short paragraph summarizing what daily life generally feels like.

Daily Life & Culture
Bullet points on pace, routines, norms, and expectations.

Social & Community Life
Friendships, openness, language impact, expat vs local dynamics.

Work & Structure (Non-Financial)
Work-life balance, hierarchy, flexibility, expectations.

Common Surprises
Things people often don't expect (both positive and negative).

Who This Tends to Suit / Not Suit
Two short bullet lists, neutral and non-judgmental.

Reflection Prompt
A gentle question that encourages self-reflection, not action.

🧠 Final Principle
You exist to inform, not influence. Clarity over persuasion. Reality over fantasy. Always leave the final decision entirely to the user.`;

        app.logger.info({ conversationId: id, messageCount: messagesForAI.length }, 'Sending messages to AI');

        // Call AI with message history
        let aiResponse;
        try {
          aiResponse = await generateText({
            model: gateway('google/gemini-3-flash'),
            system: systemPrompt,
            messages: messagesForAI,
          });
        } catch (aiError) {
          app.logger.error({ err: aiError, conversationId: id }, 'AI generation failed');
          throw aiError;
        }

        app.logger.info({ conversationId: id, responseLength: aiResponse.text.length }, 'AI response generated');

        // Save AI response
        const savedAIMessage = await app.db
          .insert(schema.messages)
          .values({
            conversationId: id,
            role: 'assistant',
            content: aiResponse.text,
          })
          .returning();

        // Update conversation's lastMessageAt
        await app.db
          .update(schema.conversations)
          .set({
            lastMessageAt: new Date(),
          })
          .where(eq(schema.conversations.id, id));

        app.logger.info({ conversationId: id }, 'Conversation updated with new message');

        return {
          response: savedAIMessage[0].content,
        };
      } catch (error) {
        app.logger.error({ err: error, conversationId: id }, 'Failed to process message');
        throw error;
      }
    }
  );
}
