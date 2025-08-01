const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

// API LINK
const apilink = 'https://dizer-adaderana-news-api.vercel.app/news';

// යවපු පුවත් ට්‍රැක් කරන්න
let sentNews = new Set();
const newsIntervals = new Map(); // JID එකට interval ට්‍රැක් කරන්න

// Start Derana News Command
cmd({
    pattern: "startnews",
    alias: ["breckingnews"],
    react: "📑",
    desc: "අලුත් Derana පුවත් ආපු විගස යවයි, එකම පුවත ආයෙ එන්නේ නැත.",
    use: ".startderana <jid>",
    category: "පුවත්",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply("*`මෙම විධානය හිමිකරුට පමණයි`*");

        if (!q) return reply("*`JID එකක් දෙන්න, උදා: .startderana 94760698006@s.whatsapp.net හෝ 120363349375266377@newsletter`*");

        const targetJid = q.trim();

        // JID එක වලංගු දැයි පරීක්ෂා කිරීම (සියලු ආකෘති සමඟ)
        const validFormats = ['@s.whatsapp.net', '@g.us', '@newsletter'];
        let isValid = false;

        for (let format of validFormats) {
            if (targetJid.includes(format)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            return reply("*`වලංගු JID එකක් නොවේ! WhatsApp JID එකක් භාවිතා කරන්න (උදා: 94760698006@s.whatsapp.net, @g.us හෝ @newsletter)`*");
        }

        // ඒ JID එකට දැනටමත් interval එකක් තිබෙනවද බලන්න
        if (newsIntervals.has(targetJid)) {
            return reply(`මේ JID එකට දැනටමත් පුවත් යැවෙනවා: ${targetJid}`);
        }

        reply(`අලුත් Derana පුවත් ආපු විගස යැවීම ආරම්භ වෙනවා JID එකට: ${targetJid}! 📑`);

        // Target JID එකට confirmation message යවනවා
        await conn.sendMessage(targetJid, { 
            text: `📑 *Derana පුවත් යැවීම ආරම්භ වුණා!* 📑\n අලුත් පුවත් ආපු විගස ඔබට ලැබෙනවා.`
        });

        // අලුත් පුවත් චෙක් කරලා යවන ක්‍රමය
        const checkAndSendNews = async () => {
            try {
                const response = await axios.get(apilink);
                const newsList = response.data; // Assuming API returns an array of news

                if (!Array.isArray(newsList)) {
                    console.error("API එකෙන් array එකක් ලැබුණේ නැත:", newsList);
                    return;
                }

                // පළමු අලුත් පුවත බලන්න
                for (let news of newsList) {
                    const newsId = news.title + news.time; // Unique identifier for news
                    if (!sentNews.has(newsId)) {
                        sentNews.add(newsId);

                        const msg = `
*🏷️ ${news.title || 'නොදන්නා'}*

✍🏻 ${news.description || 'නොදන්නා'}

📆 ${news.time || 'නොදන්නා'}
*🔗Link:* ${news.news_url || 'නොදන්නා'}

━━━━━━━━━━━━━━━━━━━━━
> *🪀Follow Us & Get Latest News👇🏻*
> https://whatsapp.com/channel/0029VbB7y6yHgZWlCfhxup1b

> © 𝐒𝐈𝐍𝐇𝐀𝐋𝐀 𝐍𝐄𝐖𝐒 𝟐𝟒𝐱𝟕"📰⚡
> 👨🏻‍💻 *ᴄʜᴇᴛʜᴍɪɴᴀ ᴋᴀᴠɪꜱʜᴀɴ*
━━━━━━━━━━━━━━━━━━━━━
                        `;

                        if (news.image) {
                            await conn.sendMessage(targetJid, { 
                                image: { url: news.image }, 
                                caption: msg 
                            });
                        } else {
                            await conn.sendMessage(targetJid, { 
                                text: msg 
                            });
                        }

                        console.log(`අලුත් Derana පුවත යැව්වා: ${news.title} -> ${targetJid}`);
                        break; // එක වතාවකට එක පුවතක් විතරක් යවන්න
                    }
                }
            } catch (e) {
                console.error('පුවත් ගැනීමේ දෝෂය:', e);
            }
        };

        // සෑම තත්පර 30කට වරක් API චෙක් කරනවා
        const intervalId = setInterval(checkAndSendNews, 30 * 1000);
        newsIntervals.set(targetJid, intervalId); // Interval එක store කරනවා

    } catch (e) {
        console.log(e);
        reply(`දෝෂයක්: ${e}`);
    }
});

// Stop Derana News Command
cmd({
    pattern: "stopnews",
    alias: ["stopnews3"],
    react: "🛑",
    desc: "Derana පුවත් යැවීම නවත්වයි",
    use: ".stopderana <jid>",
    category: "පුවත්",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply("*`මෙම විධානය හිමිකරුට පමණයි`*");

        if (!q) return reply("*`JID එකක් දෙන්න, උදා: .stopderana 94760698006@s.whatsapp.net හෝ 120363349375266377@newsletter`*");

        const targetJid = q.trim();

        // JID එක වලංගු දැයි පරීක්ෂා කිරීම (සියලු ආකෘති සමඟ)
        const validFormats = ['@s.whatsapp.net', '@g.us', '@newsletter'];
        let isValid = false;

        for (let format of validFormats) {
            if (targetJid.includes(format)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            return reply("*`වලංගු JID එකක් නොවේ! WhatsApp JID එකක් භාවිතා කරන්න (උදා: 94760698006@s.whatsapp.net, @g.us හෝ @newsletter)`*");
        }

        if (!newsIntervals.has(targetJid)) {
            return reply(`මේ JID එකට පුවත් යැවෙන්නේ නැත: ${targetJid}`);
        }

        clearInterval(newsIntervals.get(targetJid));
        newsIntervals.delete(targetJid);

        // Target JID එකට stop confirmation message යවනවා
        await conn.sendMessage(targetJid, { 
            text: `🛑 *Derana පුවත් යැවීම නැවැත්වුණා!* 🛑\n තවත් පුවත් එන්නේ නැත.`
        });

        reply(`Derana පුවත් යැවීම නැවැත්වුවා: ${targetJid}`);

    } catch (e) {
        console.log(e);
        reply(`දෝෂයක්: ${e}`);
    }
});
