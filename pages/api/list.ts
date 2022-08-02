import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { json } from "stream/consumers";
import connect from "../../service/mongo";
import { TitleType } from "../../types";

interface ErrorResponseType {
  error: string;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method == "GET") {
    const {
      title,
      limit,
      page,
      min_chap = 0,
      max_chap = 10000,
      tags,
      description,
      no_title,
      no_tags,
      no_description,
    } = req.query;

    //    res.status(200).json({ title, cap });
    const _limit = parseInt((limit as string) || "10");
    const { db, client } = await connect();
    const query = {
      $and: [
        {
          $or: [
            {
              $and: [
                { tags: { $all: (tags as string)?.split(",") || [] } },
                {
                  tags: {
                    $not: { $all: (no_tags as string)?.split(",") || [] },
                  },
                },
              ],
            },
            {
              description: description ? { $regex: description } : "__empty__",
            },
            {
              title: title ? { $regex: title } : "__empty__",
            },
          ],
        },
        { chapters: { $gt: parseFloat(min_chap) } },
        { chapters: { $lt: parseFloat(max_chap) } },
      ],
    };

    // if (title) {
    //     query.$and[0].$or.push({ title: { $regex: title } });
    // }

    // if (no_title) {
    //   query.$and.push({
    //     title: { $regex: `^((?!${no_title}).)*$`, $options: "i" },
    //   });
    // }

    // if (no_description) {
    //     query.$and.push({
    //       description: { $regex: `^((?!${no_description}).)*$`, $options: "i" },
    //     });
    //   }

    console.log(JSON.stringify(query));
    const manga_titles = await db
      .collection("list")
      .find<TitleType>(query)
      .skip((parseInt((page as string) || "1") - 1) * _limit)
      .limit(_limit)
      .sort({ chapters: -1 })
      .project({
        chapters: 1,
        title: 1,
        description: 1,
        tags: 1,
        thumb: 1,
        link: 1,
        _id: 0,
      })
      .toArray();

    const totalTitles = await db
      .collection("list")
      .find<TitleType>(query)
      .toArray();

    res.status(200).json({ total: totalTitles.length, titles: manga_titles });

    //     if (validManga(manga)) {
    //       const { db } = await connect();
    //       const response = await db.collection("mangas").findOne({ name: name });
    //       res.status(200).json(response);
    //     } else {
    //       res.status(400).json({ error: "Missing fields" });
    //     }
    //   } else if (req.method == "GET") {
    //     res.setHeader("Cache-Control", "s-maxage-600, stale-while-revalidate");
    //     const { db } = await connect();
    //     const response = await db.collection("mangas").find().toArray();
    //     res.status(200).json(response);
    //   } else {
    //     res.status(400).json({ errror: "Invalid Method" });
    //   }
  } else {
    res.status(500).json({ erro: "kabo" });
  }
};
