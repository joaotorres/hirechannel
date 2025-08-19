# Hirechannel Technical Assessment

Welcome to the Hirechannel technical assessment! This challenge is designed to evaluate your fullstack development skills, with a focus on video handling and system integration capabilities.

Should you have any doubts, feedback or questions, please don't hesitate to contact alvaro@hirechannel.com.

Please, read the whole document before starting the assessment.

## ⚠️ Disclaimer
- This is a paid assessment with a compensation of a 300€ Amazon gift card to be sent after the assessment is submitted
- This technical assessment is solely for evaluation purposes
- Participation does not imply or guarantee any employment relationship
- The results of this assessment will not be used internally.
- The results will not be used for any other purposes under any circumstances

After reading the document and prior to starting the assessment, you must send an email to alvaro@hirechannel.com confirming your acceptance of the terms above:

```
Subject: Hirechannel Technical Assessment Acceptance

Hello,

I accept the terms and conditions of the Hirechannel technical assessment.

The terms and conditions are:

- This is a paid assessment with a compensation of a 300€ Amazon gift card to be sent after the assessment is submitted
- This technical assessment is solely for evaluation purposes
- Participation does not imply or guarantee any employment relationship
- The results of this assessment will not be used internally by Hirechannel
- The results will not be used for any other purposes under any circumstances

Best regards,

[Your Name]
```

## Table of Contents
- [Objective](#-objective)
- [Key Requirements](#-key-requirements)
  - [Frontend](#frontend-estimated-15-2h)
  - [Backend](#backend-estimated-15-2h)
- [Technical Guidelines](#-technical-guidelines)
- [Simplifications](#simplifications)
- [Bonus Features (Optional)](#-bonus-features-optional)
- [Submission Requirements](#-submission-requirements)
- [Time Expectation](#️-time-expectation)
- [Evaluation Criteria](#-evaluation-criteria)
- [Getting Started](#-getting-started)
- [Notes](#-notes)

## 🎯 Objective

Build a simplified version of a video interview system where candidates can record their answers to a predefined question, and the system processes and evaluates the recording automatically using AI.

## 🔑 Key Requirements

### Frontend
- Build a single-page application using React.
- Feel free to use any libraries you want.
- Allow candidates to record video answers (max 60 seconds) for up to 5 questions of your choice. Some examples could be: 
**“Tell us about yourself”**
**“What’s your greatest achievement?”**
**“Where do you see yourself in 5 years?”**
**“Why do you want to work with us?”** 
**“How do you handle working under pressure?”**

- Essential features:
  - Camera/microphone permission handling.
  - Start/stop recording controls.
  - A clean, simple UI (no authentication required).
  - A timer: once the candidate starts recording, the timer should start. Once the timer reaches 0, the recording should stop and go to the next question.

### Backend
Build a Node.js backend with a key integration to process the recording:
- **AI Evaluation System**
   - Transcribe the recorded video using a Speech-to-Text API.
   - Send the transcription to an LLM to evaluate the candidate's answer.
   - Retrieve an evaluation score (from 1 to 5) for the candidate's answer. You don't need to display the score in the frontend. Just print it to the console in the server. The evaluation criteria is up to you.
   - Process these steps independently and asynchronously from the main recording flow.
   - As part of your solution, please include the exact prompt you used to evaluate the candidate's answer using the LLM

Note: We will provide an OpenAI API key for you to use in this assessment.

The solution must be extensible and loosely coupled with the answer submission flow.

## 💡 Technical Guidelines

- **Architecture**: Use Node.js for the backend. Design your solution for easy extensibility.
- **Async Processing**: Keep the main flow responsive while processing
- **Browser Handling**: 
  - Focus on compatibility with the latest versions of Chrome or any Chromium-based browser.

## Simplifications

To help you complete the challenge within the time limit, **you do not need** to implement:
- Authentication
- A persistent database (in-memory storage is sufficient)
- Complex UI designs
- User accounts or job position management
- Testing
- Complex error recovery (basic error messages are sufficient)
- Perfect code organization (focus on functionality first)

## 🎁 Bonus Features (Optional)

If you finish early, feel free to:
- add additional fun integrations or creative features. Anything you want!

Note: Only attempt these if you've completed all core requirements with time to spare.

## 📝 Submission Requirements

### Code Repository
- Please create a new repository using this repository as a template (click "Use this template" button) and add GitHub users `monterrubio12` and `Couds` as a collaborators.

### Screen Recording
Record your screen **only during the first 2 hours** of assessment-related tasks, including:
- Your implementation process
- Any searches or documentation lookups, usage of resources, tools, or AI assistants (we encourage using these tools to be more productive!)
- Problem-solving activities related to this challenge

This recording helps us:
- Understand your workflow and problem-solving approach
- Validate the authenticity of your work
- Gain insight into your coding practices

*Note: Please only record activities directly related to this assessment. Make sure the recording quality is clear and readable. You can use any screen recording software you prefer.*


## ⏱️ Time Expectation

Approximately 4-5 hours.

### 🚨 Important Note

When you reach the 2 hours mark, please:
1. Stop recording your screen.
2. Record a brief video recording summarizing and providing context about what you did. Feel free to give any feedback or suggestions for the assessment.
3. Before continuing, send an email to alvaro@hirechannel.com letting us know you're done with the first 2 hours and send us the video recording of the first 2 hours and the summary video.
4. After that, you will have 24 hours to complete the assessment. No recording is needed for this step.
5. Once you're done, we will review your submission and get back to you for a follow-up video call.

**We value your time** and want to understand your thought process, even if not all features are completed. The follow-up discussion will give us insight into your problem-solving approach and technical vision for the complete solution. Your feedback on the time estimation will help us improve our assessment process.


## 🔍 Evaluation Criteria

| Area          | Key Points                                                       |
|---------------|------------------------------------------------------------------|
| **Frontend**  | Clean UI; robust media handling; effective error feedback        |
| **Backend**   | Thoughtful system design; well-implemented integrations            |
| **Code Quality** | Clean, maintainable, well-documented code                     |
| **Problem Solving** | Sound architecture decisions     |

## 🚀 Getting Started

1. Create your own private repository using this repository as a template:
   - Click the green "Use this template" button at the top of this page
   - Select "Create a new repository"
   - Make sure to set it as "Private"
   - Create your repository
2. Add GitHub users `monterrubio12` and `Couds`as a collaborator to your new repository:
   - Go to Settings > Collaborators
   - Click "Add people"
   - Enter `monterrubio12`
   - Select "Add to repository"
   - Repeat for the rest of users
3. Implement the required features based on the guidelines above.
4. Submit your solution.

## 📋 Notes

- You may use any AI tools (ChatGPT, GitHub Copilot, etc.). Use anything that makes you more productive.
- Focus on building a functional solution over a pixel-perfect UI.
- If you have any questions, feel free to ask.
- Don't worry about perfect code organization—we value working functionality over perfect architecture.

**Good luck!** 🎉
