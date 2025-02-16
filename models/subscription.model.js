import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Subscription name is required"],
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    price: {
        type: Number,
        required: [true, "Subscription price is required"],
        min: [0, "Price must be greater than 0"],
    },
    currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "ZAR"],
        default: "ZAR",
    },
    frequency: { // Fixed typo here
        type: String,
        enum: ["daily", "weekly", "monthly", "annually"],
    },
    category: {
        type: String,
        enum: ["Business", "Entertainment", "General", "Health", "Science", "Sports", "Technology", "Other"],
        required: [true, "Category is required"],
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active",
    },
    startDate: {
        type: Date,
        required: [true, "Subscription start date is required"],
        validate: {
            validator: (value) => value < new Date(),
            message: "Start date must be in the past",
        },
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: "Renewal date must be after start date",
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
}, { timestamps: true });

// Auto-calculate renewal date if missing.
subscriptionSchema.pre("save", function (next) {
    if (!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            annually: 365, // Fixed "yearly" to "annually"
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // Auto-update the status if renewal date has passed
    if (this.renewalDate < new Date()) {
        this.status = "expired";
    }

    next();
});

const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
