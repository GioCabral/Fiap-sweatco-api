import express from "express";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();

router.post("/", async (req, res) => {
  try {
    let db = req.connect;
    let activityColl = db.collection("activities");
    let usersColl = db.collection("users");

    let ranking = await activityColl
      .aggregate([
        { $match: {} },
        {
          $group: {
            _id: "$user",
            time: { $sum: "$time" },
          },
        },
        { $sort: { time: -1 } },
      ])
      .toArray();

    let users = await usersColl
      .find({ _id: { $in: ranking.map((place) => place._id) } })
      .toArray();

    ranking = ranking.map((place) => {
      let user = users.find(
        (user) => user._id.toString() === place._id.toString()
      );
      return {
        ...place,
        time: (place.time / 60).toFixed(2),
        user: user.name,
      };
    });

    res.status(201).send(ranking);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
