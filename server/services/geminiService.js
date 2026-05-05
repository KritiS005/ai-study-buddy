import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  return new GoogleGenAI({ apiKey });
};

const safeJsonParse = (text, fallback) => {
  try {
    const cleaned = String(text || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Raw AI response:", text);
    return fallback;
  }
};

export const getChatResponse = async (message, history = []) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const systemInstruction =
    "You are StudyBuddy, a strict study-only AI tutor for students. You can only answer questions related to academics, school or college subjects, coding, programming, projects, assignments, exam preparation, revision, study planning, productivity, motivation for learning, career learning, internships, placements, and student skill development. If the user asks anything unrelated to studying or student growth, do not answer it directly. Politely reply exactly: 'I am your StudyBuddy, so I can only help with study, learning, coding, projects, exams, productivity, and academic goals. Please ask something related to your learning.' Keep valid study-related answers clear, simple, practical, and step-by-step.";

  const contents = [
    ...history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    })),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction
    }
  });

  return response.text;
};

export const generateStudyPlan = async (userData = {}) => {
  const ai = getAI();

  const model = "gemini-3-flash-preview";

  const subjects = Array.isArray(userData.subjects)
    ? userData.subjects
    : String(userData.subjects || "")
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

  const finalSubjects = subjects.length
    ? subjects
    : ["Computer Science", "DSA", "DBMS"];

  const selectedDate =
    userData.selectedDate || new Date().toISOString().slice(0, 10);

  const difficulty = userData.difficulty || "Balanced";

  const prompt = `
Generate a practical study schedule as JSON only.

Student details:
Subjects: ${finalSubjects.join(", ")}
Weak Topics: ${userData.weakTopics || "General revision"}
Target Daily Hours: ${userData.dailyHours || 4}
Exam Dates: ${userData.examDates || "Next month"}
Preferred Study Time: ${userData.preferredTime || "Evening"}
Difficulty: ${difficulty}
Break Preference: ${userData.breakPreference || "Pomodoro"}

Return ONLY a JSON array.
Create 3 to 6 study slots.

Each item must contain exactly these fields:
{
  "id": "unique string",
  "date": "${selectedDate}",
  "startTime": "09:00 AM",
  "duration": "45 min",
  "subject": "subject name",
  "topic": "topic to study",
  "difficulty": "${difficulty}",
  "status": "pending"
}

Rules:
- date must be "${selectedDate}" for every slot
- status must be "pending"
- duration must be like "45 min" or "60 min"
- subject must be from the given subjects
- return valid JSON only, no markdown
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const parsed = safeJsonParse(response.text, []);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((slot, index) => ({
    id: slot.id || `${Date.now()}-${index}`,
    date: slot.date || selectedDate,
    startTime: slot.startTime || "09:00 AM",
    duration: slot.duration || "45 min",
    subject: slot.subject || finalSubjects[index % finalSubjects.length],
    topic:
      slot.topic ||
      `Revise important concepts of ${
        finalSubjects[index % finalSubjects.length]
      }`,
    difficulty: slot.difficulty || difficulty,
    status: "pending"
  }));
};

export const getBurnoutAdvice = async (riskLevel, userData = {}) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const prompt = `
A student has a ${riskLevel || "medium"} burnout risk level.

Recent Mood: ${userData.avgMood || "Not available"}
Study Hours: ${userData.studyHours || "Not available"}
Task Completion: ${userData.taskCompletion || 0}%

Provide 3-4 specific, practical recovery tips and a short motivational message.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text;
};

export const getRecommendations = async (activity) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const prompt = `
Based on recent activity: ${activity || "No recent activity"}, suggest:
1. Next best topic to study
2. A break activity
3. A quick productivity tip

Return as valid JSON object only with keys:
nextTopic, breakActivity, productivityTip
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const parsed = safeJsonParse(response.text, null);

  return (
    parsed || {
      nextTopic: "Revise your most difficult subject",
      breakActivity: "Take a 5 minute walk",
      productivityTip: "Use a 25-minute Pomodoro timer"
    }
  );
};

export const getDailyTip = async () => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents:
      "Generate one unique, effective daily study tip for a student. Be concise."
  });

  return response.text;
};
