# SalesHQ — Control-Tower for Humans + AI Agents

## Inspiration 🚀
Modern sales teams are field-testing “digital teammates” (LLM-powered bots that prospect, research, write outreach, and schedule meetings).  
But today those bots live in **separate dashboards, noisy Slack channels, and siloed CRMs**.  
We kept hearing the same complaints from sales leaders:

* “I’m drowning in bot pings.”  
* “I can’t see *why* the AI decided to do that.”  
* “Every new agent means another tab.”  

We thought: **what if a sales org had an air-traffic-control tower** that showed *deals, bots, and humans* in one place—so reps steer while agents hustle in the background?

## What We Built 🛠️
**SalesHQ** is that tower:

* **Unified Dashboard** — Sales metrics & important account chats in a single view.  
* **Account Rooms** — Slack-style threads where bots drop drafts, humans approve inline.  
* **Silent Inter-Agent Comms** — Bots whisper via the Google A-2-A protocol; no human spam.  
* **Extras** — ResearcherBot pulls fresh facts with Apify

All of it runs end-to-end in **TypeScript**.

## How We Built It ⚙️
| Layer | Tooling |
|-------|---------|
| AI Agents | **AgentKit** workers (Prospector, Researcher, SDR, Scheduler) |
| Inter-Agent |**Google A-2-A protocol** tasks / results |
| Frontend | **Vite** (dark, neon-teal theme) |
| External APIs | Apify Website Crawler via MCP |

## What We Learned 📚
* **Agent orchestration is UX, not just code.** Users love “silent” coordination far more than raw chat dumps.  
* **A-2-A Protocol** makes multi-agent pipelines trivial once the JSON schemas are right.  
* **Apify MCP** saves brain cycles

## Challenges We Faced 🧗‍♂️
1. **Noise vs. Insight** — Tuning when bots post versus whisper took multiple UX iterations.  
2. **A-2-A Implementation** 

## What’s Next 🌱
* Fine-grained permissions so an SDR-bot can’t email Tier-1 accounts without human sign-off.  
* Open-source agent templates so any dev team can plug their own bots into SalesHQ.

*Built in 8 caffeine-fueled hours by Bayram & Merdan.*

## Resources 📚
* [Project Deck](20250530_AWSMCPHack_SalesHQ.pdf) - Detailed presentation of SalesHQ's architecture and features
