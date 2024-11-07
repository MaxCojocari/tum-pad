from pybreaker import CircuitBreaker
from config.configuration import FAIL_MAX

# import time
# from functools import wraps

# class CircuitBreakerError(Exception):
#     """Exception raised when the circuit is open."""
#     pass

# class CircuitBreaker:
#     def __init__(self, fail_max, reset_timeout):
#         self.fail_max = fail_max                  # Maximum number of allowed failures before opening the circuit
#         self.reset_timeout = reset_timeout        # Time in seconds before transitioning to half-open state
#         self.fail_count = 0                       # Number of consecutive failures
#         self.state = "closed"                     # Initial state of the circuit breaker
#         self.last_failure_time = None             # Last time a failure occurred
    
#     def _current_time(self):
#         return time.time()
    
#     def _enter_open_state(self):
#         self.state = "open"
#         self.last_failure_time = self._current_time()
#         print("Circuit opened due to consecutive failures.")

#     def _enter_half_open_state(self):
#         self.state = "half-open"
#         print("Circuit transitioned to half-open state for testing.")

#     def _reset(self):
#         self.fail_count = 0
#         self.state = "closed"
#         print("Circuit reset to closed state.")
    
#     def _can_attempt_request(self):
#         # Check if reset timeout has passed to allow half-open testing
#         if self.state == "open" and (self._current_time() - self.last_failure_time) >= self.reset_timeout:
#             self._enter_half_open_state()
        
#         return self.state in ["closed", "half-open"]

#     def call(self, func, *args, **kwargs):
#         if not self._can_attempt_request():
#             raise CircuitBreakerError("Circuit is open; requests are blocked.")
        
#         try:
#             result = func(*args, **kwargs)
            
#             # If successful in half-open, reset the circuit
#             if self.state == "half-open":
#                 self._reset()
            
#             return result
#         except Exception as e:
#             self.fail_count += 1
#             print(f"Failure encountered: {e} (failure count: {self.fail_count})")
            
#             if self.fail_count >= self.fail_max:
#                 self._enter_open_state()
#             elif self.state == "half-open":
#                 self._enter_open_state()
            
#             raise

#     def __call__(self, func):
#         """Decorator to use the circuit breaker on a function."""
#         @wraps(func)
#         def wrapper(*args, **kwargs):
#             return self.call(func, *args, **kwargs)
#         return wrapper
    
#     # Manually open the circuit
#     def open(self):
#         self.state = "open"
#         self.last_failure_time = self._current_time()
#         print("Circuit manually opened.")

#     # Manually close (reset) the circuit
#     def close(self):
#         self._reset()
#         print("Circuit manually closed and reset.")


auction_breaker = CircuitBreaker(fail_max=FAIL_MAX, reset_timeout=10)
bidder_breaker = CircuitBreaker(fail_max=FAIL_MAX, reset_timeout=10)