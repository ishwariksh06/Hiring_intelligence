// Simulates network latency so loading states are exercised even against mock data.
export function mockDelay(data, ms = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

export function mockError(message, ms = 500) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

// Flip to true to force API layers to use real axiosClient calls instead of mock data.
export const USE_MOCK_API = true;
