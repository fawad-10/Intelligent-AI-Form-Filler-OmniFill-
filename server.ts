import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Secure server-side initialization of Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyPlaceholder = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint - Intelligent Form-Field AI Mapping Engine
  app.post("/api/map-fields", async (req, res) => {
    try {
      const { fields, profile, customInstructions } = req.body;

      if (!fields || !profile) {
        return res.status(400).json({ error: "Missing fields or profile data." });
      }

      // Check if API key is valid and not a placeholder
      if (isApiKeyPlaceholder) {
        console.warn("⚠️ GEMINI_API_KEY is not defined or is a placeholder. Using intelligent heuristics fallback.");
        // Heuristics fallback to keep app fully active and premium-feeling even in offline modes!
        const mappings = fields.map((f: any) => {
          let val = "";
          let reason = "Heuristic match (Backup offline mode)";
          const idLower = (f.id || "").toLowerCase();
          const nameLower = (f.name || "").toLowerCase();
          const labelLower = (f.label || "").toLowerCase();
          const placeholderLower = (f.placeholder || "").toLowerCase();

          const matchCheck = (term: string) => 
            idLower.includes(term) || nameLower.includes(term) || 
            labelLower.includes(term) || placeholderLower.includes(term);

          if (matchCheck("first") || matchCheck("fname")) {
            val = profile.personal.firstName;
            reason = "Heuristic match for First Name";
          } else if (matchCheck("last") || matchCheck("lname")) {
            val = profile.personal.lastName;
            reason = "Heuristic match for Last Name";
          } else if (matchCheck("fullname") || matchCheck("full_name") || matchCheck("name")) {
            val = `${profile.personal.firstName} ${profile.personal.lastName}`;
            reason = "Heuristic match for Full Name";
          } else if (matchCheck("email")) {
            val = profile.personal.email;
            reason = "Heuristic match for Email";
          } else if (matchCheck("phone") || matchCheck("cell") || matchCheck("tel")) {
            val = profile.personal.phone;
            reason = "Heuristic match for Contact Phone";
          } else if (matchCheck("birth") || matchCheck("dob") || matchCheck("date")) {
            val = profile.personal.birthDate;
            reason = "Heuristic match for DOB";
          } else if (matchCheck("linkedin")) {
            val = profile.personal.linkedin;
            reason = "Social Link matching";
          } else if (matchCheck("portfolio") || matchCheck("website") || matchCheck("site")) {
            val = profile.personal.portfolio;
            reason = "Portfolio matching";
          } else if (matchCheck("summary") || matchCheck("goals") || matchCheck("profile") || matchCheck("about") || matchCheck("desc")) {
            val = profile.personal.summary;
            reason = "Biography matching";
          } else if (matchCheck("company")) {
            val = profile.experience?.[0]?.company || "";
            reason = "Most recent enterprise matching";
          } else if (matchCheck("role") || matchCheck("title")) {
            if (f.options && f.options.length > 0) {
              val = f.options[0]; // pick first option as fallback
            } else {
              val = profile.experience?.[0]?.role || "";
            }
            reason = "Role evaluation match";
          } else if (matchCheck("skills") || matchCheck("technology")) {
            val = profile.skills.slice(0, 6).join(", ");
            reason = "Skills enumeration matching";
          } else if (matchCheck("school") || matchCheck("university")) {
            val = profile.education?.[0]?.school || "";
            reason = "Education school match";
          }

          // If select-one or radio, force choice
          if ((f.type === "select-one" || f.type === "radio") && f.options && f.options.length > 0) {
            if (!f.options.includes(val)) {
              // try simple substring match
              const matchedOpt = f.options.find((opt: string) => 
                opt.toLowerCase().includes(val.toLowerCase()) || 
                val.toLowerCase().includes(opt.toLowerCase())
              );
              val = matchedOpt || f.options[0];
            }
          }

          return {
            fieldId: f.id,
            value: val,
            confidence: val ? 0.82 : 0.1,
            reasoning: val ? reason : "No matching attribute found in the user profile."
          };
        });

        return res.json({ mappings, offlineMode: true });
      }

      // Prepare professional context prompt
      const fieldsString = JSON.stringify(fields, null, 2);
      const profileString = JSON.stringify(profile, null, 2);

      const prompt = `Map these web fields against the user's profile:
      
      === Web Fields ===
      ${fieldsString}
      
      === User Profile ===
      ${profileString}
      
      === Custom Site Overlay Instructions / Guidelines ===
      ${customInstructions || "No secondary custom instructions defined for this page."}
      
      Please execute the mapping matches carefully. Return the responses in strict JSON matching the schema properties of: mappings (array of objects containing: fieldId, value, confidence, reasoning).`;

      const systemInstruction = `You are the core AI matching engine for the "Intelligent AI Form-Filler Chrome Extension".
Your task is to analyze details of active DOM web form inputs (id, name, type, label, placeholder, parent section context, lists of selections) and map each field identifier to the corresponding target fill value derived from the user's detailed personal/professional profile.
Follow these requirements precisely:
1. Provide a fill value for each field that is a logical match. If no match can be reasonably made, set the value to a blank string "".
2. Very important for select-one and radio inputs containing option lists: you MUST select exactly one of the strings available in the 'options' array. Choose the option that matches best. Do not return a value outside the listed options.
3. For dates, format as YYYY-MM-DD.
4. If a custom instruction exists, modify your selections to fulfill it. For example, if it says "focus on React and Tailwind, ignore Backend info on Linkedin forms", select React/Tailwind elements and skip Node/Python references.
5. Under confidence, assess how accurate the mapping is between 0.0 and 1.0.
6. Provide brief, structured professional reasoning (1 sentence) for each selection.`;

      // Call Gemini 3.5 Flash Model using the SDK
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mappings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fieldId: {
                      type: Type.STRING,
                      description: "The unique ID of the scanned form field",
                    },
                    value: {
                      type: Type.STRING,
                      description: "The resolved value extracted/mapped from the user profile or option set",
                    },
                    confidence: {
                      type: Type.NUMBER,
                      description: "Match confidence from 0.0 to 1.0",
                    },
                    reasoning: {
                      type: Type.STRING,
                      description: "Why this profile value matches this web field",
                    },
                  },
                  required: ["fieldId", "value", "confidence", "reasoning"],
                },
              },
            },
            required: ["mappings"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini engine.");
      }

      const jsonOutput = JSON.parse(responseText.trim());
      res.json(jsonOutput);
    } catch (error: any) {
      console.error("🔴 AI Mapping Service Error:", error);
      res.status(500).json({
        error: "AI Form-Mapping computation failed.",
        details: error?.message || "Internal error",
      });
    }
  });

  // Serve static assets or mount Vite Developer mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 AI Form-Filler Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
