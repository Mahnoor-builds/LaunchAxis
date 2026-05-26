// AiEngine.js - The Brain of LaunchAxis

// === THE CEO SWITCH ===
// Set to false: Uses instant fake data so you can test your UI.
// Set to true: Actually calls Gemini and Pexels using your .env keys.
const USE_REAL_AI = false; 

export const generateBusinessSetup = async (userData) => {
    
    // 1. THE MOCK ENGINE (Instant UI Testing)
    if (!USE_REAL_AI) {
        console.log("CEO Switch is OFF: Returning Mock Data for Testing");
        return {
            themeColor: userData.businessType === 'Products' ? '#f43f5e' : '#3b82f6', 
            branding: {
                name: userData.businessName,
                slogan: "Innovation meets excellence.",
                industry: userData.businessType,
                logo: "", 
                owners: [{ name: 'Admin', role: 'Founder' }]
            },
            heroImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=2070&auto=format&fit=crop",
            products: [
                { id: 1, name: `Premium ${userData.businessName} Item`, price: 5000, description: 'Our flagship offering.', status: 'active', images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"] },
                { id: 2, name: 'Essential Package', price: 2500, description: 'Perfect for getting started.', status: 'active', images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"] }
            ],
            features: {
                wantsWebsite: userData.preferences?.includes("Business Website") || false,
                wantsAccounting: userData.preferences?.includes("Accounting Setup") || false,
                wantsBranding: userData.preferences?.includes("Logo & Branding Kit") || false
            }
        };
    }

    // 2. THE REAL AI ENGINE (Gemini + Pexels)
    console.log("CEO Switch is ON: Calling APIs...");
    try {
        const geminiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const pexelsKey = process.env.REACT_APP_PEXELS_API_KEY;

        if (!geminiKey || !pexelsKey) {
            throw new Error("API Keys are missing from your .env file!");
        }

        const prompt = `
        You are an elite business architect. The user wants to build a business called "${userData.businessName}".
        Description: "${userData.extraDetails || userData.businessDesc}"
        Type: "${userData.businessType}"

        Generate a JSON object with this exact structure:
        {
          "themeColor": "A specific hex code that fits their brand (e.g., #2dd4bf)",
          "slogan": "A short, punchy 3-4 word slogan",
          "imageSearchKeyword": "One highly specific visual keyword to search on a stock photo site",
          "products": [
             { "name": "Product 1 Name", "price": 4000, "description": "Short description" },
             { "name": "Product 2 Name", "price": 1500, "description": "Short description" }
          ]
        }
        Return ONLY valid JSON.
        `;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const geminiData = await geminiResponse.json();
        const cleanJsonText = geminiData.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(cleanJsonText);

        const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${aiResult.imageSearchKeyword}&per_page=3`, {
            headers: { Authorization: pexelsKey }
        });
        const pexelsData = await pexelsResponse.json();
        
        const heroPhoto = pexelsData.photos[0]?.src?.large || "https://images.unsplash.com/photo-1441986300917-64674bd600d8";
        const prod1Photo = pexelsData.photos[1]?.src?.medium || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";
        const prod2Photo = pexelsData.photos[2]?.src?.medium || "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

        return {
            themeColor: aiResult.themeColor,
            branding: {
                name: userData.businessName,
                slogan: aiResult.slogan,
                industry: userData.businessType,
                logo: "",
                owners: [{ name: userData.email?.split('@')[0] || 'Founder', role: 'Founder' }]
            },
            heroImage: heroPhoto,
            products: [
                { id: 101, name: aiResult.products[0].name, price: aiResult.products[0].price, description: aiResult.products[0].description, status: 'active', images: [prod1Photo] },
                { id: 102, name: aiResult.products[1].name, price: aiResult.products[1].price, description: aiResult.products[1].description, status: 'active', images: [prod2Photo] }
            ],
            features: {
                wantsWebsite: userData.preferences?.includes("Business Website") || false,
                wantsAccounting: userData.preferences?.includes("Accounting Setup") || false,
                wantsBranding: userData.preferences?.includes("Logo & Branding Kit") || false
            }
        };

    } catch (error) {
        console.error("AI Engine Failed:", error);
        return null; 
    }
};