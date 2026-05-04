const mongoose = require("mongoose");

/**
 * Blacklist Token Schema
 * Stores invalidated JWT tokens (used for logout security)
 */
const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const BlacklistTokenModel = mongoose.model(
  "blacklistTokens",
  blacklistTokenSchema,
);

module.exports = BlacklistTokenModel;
