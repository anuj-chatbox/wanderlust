const mongoose = require("mongoose");
const Review = require("./review");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    type: String,
    default:
      "https://www.bing.com/ck/a?!&&p=f75a0e3e60d2c6d215a6da1770d2ca9d6f5e90fb0d07fb739674a0a7add0237aJmltdHM9MTc2NzM5ODQwMA&ptn=3&ver=2&hsh=4&fclid=2507448d-e0d7-6aec-338f-52e1e1256bf2&u=a1L2ltYWdlcy9zZWFyY2g_cT1veW8rcGljJmlkPUU3OTVEQzlCN0UxQUNCNUMwRDJDMjEzM0FCRUNBN0I3QUMxODcxQzUmRk9STT1JQUNGSVI&ntb=1",
    set: (v) =>
      v === ""
        ? "https://www.bing.com/ck/a?!&&p=f75a0e3e60d2c6d215a6da1770d2ca9d6f5e90fb0d07fb739674a0a7add0237aJmltdHM9MTc2NzM5ODQwMA&ptn=3&ver=2&hsh=4&fclid=2507448d-e0d7-6aec-338f-52e1e1256bf2&u=a1L2ltYWdlcy9zZWFyY2g_cT1veW8rcGljJmlkPUU3OTVEQzlCN0UxQUNCNUMwRDJDMjEzM0FCRUNBN0I3QUMxODcxQzUmRk9STT1JQUNGSVI&ntb=1"
        : v,
  },

  price: Number,
  location: String,
  country: String,

  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],

  owner: { type: Schema.Types.ObjectId, ref: "User" },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
