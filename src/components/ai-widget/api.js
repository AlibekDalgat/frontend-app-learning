import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBase = () => `${getConfig().LMS_BASE_URL}/api/ai-assis`;

export async function getSession(contextKey) {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.get(
    `${getApiBase()}/session/?context_key=${encodeURIComponent(contextKey)}`
  );
  return data;
}

export async function sendMessage(ragSessionId, query, courseId = null, lessonId = null) {
  const client = getAuthenticatedHttpClient();
  try {
    const response = await client.post(
      `${getConfig().LMS_BASE_URL}/api/ai-assis/query/`,
      {
        rag_session_id: ragSessionId,
        query,
        course_id: courseId,
        lesson_id: lessonId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        responseType: 'stream',
        adapter: 'fetch',
        withCredentials: true,
      }
    );

    return response;
  } catch (error) {
    console.error('AI streaming request failed:', error);
    throw error;
  }
}

export async function clearHistory(ragSessionId) {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.delete(`${getApiBase()}/chat/`, {
    data: { rag_session_id: ragSessionId },
  });
  return data;
}