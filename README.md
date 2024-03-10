_Experimentation repo for performing web based tasks using AutoGPT and Playwright._

## Introduction

Use the power of LLMs to run monotonus tasks in the browser and take screenshots using AutoGPT and Playwright.

### Usage

Make sure you have [bun](https://bun.sh) installed and an OpenAI api key set

1. Run `bun install`
2. Give the agent a goal of what it should achieve together with a context
3. Run with `bun run ./src/index.ts`

The intended outcome is a group of screenshots from the flow the agent just ran using Playwright. However, it usually takes a few runs before it manages to run through the flow as intended.
