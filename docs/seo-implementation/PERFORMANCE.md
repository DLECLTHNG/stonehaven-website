# Synthetic mobile comparison

Headless Chrome, 390x844, CPU 4x, 150ms latency, 200KB/s down, fresh contexts; analytics blocked equally. Two synthetic runs per page, not field Core Web Vitals. INP not measured.

| Page | Before LCP, mean ms | After LCP, mean ms | Before CLS, mean | After CLS, mean |
|---|---:|---:|---:|---:|
| / | 812 | 832 | 0.0033 | 0.0031 |
| /heloc | 678 | 688 | 0.0049 | 0.0032 |
| /dscr | 894 | 876 | 0.0509 | 0.0500 |
| /blog/dscr-loans-georgia-investor-guide | 832 | 818 | 0.0202 | 0.0202 |

The limited local sample shows similar loading behavior. It does not establish field performance, INP, a statistically significant improvement, or a Google ranking outcome. The production network, analytics, user devices, and traffic distribution will differ.
