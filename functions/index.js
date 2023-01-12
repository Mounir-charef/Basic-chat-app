const functions = require("firebase-functions");
const Filter = require("bad-words");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.determineRegion = functions.firestore
    .document("messages/{msgId}")
    .onCreate(async (doc, ctx) => {
        const filter = new Filter();
        const { text, uid } = doc.data();

        if (filter.isProfane(text)) {
            const cleaned = filter.clean(text);
            await doc.ref.update({ text: `🤐 I got BANNED for life for saying... ${cleaned}` });
        }

        const userRef = db.collection("users").doc(uid);
        const userData = (await userRef.get()).data();

        if (userData.msgCount >= 5) {
            const query = db.collection("messages").where("uid", "==", uid).orderBy("createdAt").limit(1);
            const recentMessages = await query.get();
            const [spamMessage] = recentMessages.docs;
            await spamMessage.ref.delete();
        } else {
            await userRef.update({ msgCount: admin.firestore.FieldValue.increment(1) });
        }

        return true;
    })

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
