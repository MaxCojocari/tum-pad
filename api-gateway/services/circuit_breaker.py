import time
import requests

class CircuitBreakerOpenError(Exception):
    """
    Exception raised when the circuit breaker is open.
    """
    def __init__(self, message="Circuit breaker is OPEN. Service calls are blocked."):
        self.message = message
        super().__init__(self.message)

class CircuitBreaker:
    def __init__(self, task_timeout, threshold=3, multiplier=3.5, retry_attempts=3, retry_backoff=1):
        self.task_timeout = task_timeout
        self.threshold = threshold
        self.failure_threshold_time = task_timeout * multiplier
        self.consecutive_failures = 0
        self.last_failure_time = None
        self.state = 'CLOSED'  # Circuit states: CLOSED, OPEN
        self.service_removed = False
        self.retry_attempts = retry_attempts  # Number of retries before considering failure
        self.retry_backoff = retry_backoff  # Delay between retry attempts

    def _current_time(self):
        return time.time()

    def reset(self):
        """Reset the circuit breaker to the initial state."""
        self.consecutive_failures = 0
        self.last_failure_time = None
        self.state = 'CLOSED'
        self.service_removed = False

    def log_failure(self):
        """
        Log the failure and potentially trip the circuit breaker.
        """
        current_time = self._current_time()

        # Update consecutive failure count
        if self.last_failure_time and (current_time - self.last_failure_time) <= self.failure_threshold_time:
            self.consecutive_failures += 1
        else:
            # Reset failure count if outside the threshold time window
            self.consecutive_failures = 1

        self.last_failure_time = current_time

        # Trip the circuit if failure threshold is reached
        if self.consecutive_failures >= self.threshold:
            self.trip()

    def trip(self):
        """
        Trip the circuit breaker and log the event.
        """
        self.state = 'OPEN'
        raise CircuitBreakerOpenError()

    def retry_request(self, request_func, *args, **kwargs):
        """
        Retries the request for the specified number of attempts.
        """
        for attempt in range(self.retry_attempts):
            try:
                response = request_func(*args, **kwargs)
                response.raise_for_status()
                return response
            except Exception as e:
                print(f"Retry {attempt + 1}/{self.retry_attempts} failed with error: {e}")
                self.log_failure()
                time.sleep(self.retry_backoff)

    def call(self, service_function, *args, **kwargs):
        """
        Attempt to call a service with retries and handle circuit breaker behavior.
        """
        
        if self.state == 'OPEN':
            raise CircuitBreakerOpenError()

        result = self.retry_request(service_function, *args, **kwargs)
        self.reset()
        return result

# Example service function that makes a real HTTP GET request
def make_request(url):
    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        raise Exception(f"Request failed with status code {response.status_code}")
    return response.text

# Example usage with an actual HTTP request (to a stable and unstable service)
if __name__ == '__main__':
    circuit_breaker = CircuitBreaker(task_timeout=5, retry_attempts=3)

    # Simulating a failed service (e.g., unreachable or bad endpoint)
    for i in range(5):
        response = circuit_breaker.call_service(make_request, 'http://example.com/invalid-endpoint')
        print(response)

    # Simulate a successful service call
    print("Trying stable service after failures...")
    response = circuit_breaker.call_service(make_request, 'http://example.com')
    print(response)
