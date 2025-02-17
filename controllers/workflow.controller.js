import {createRequire} from "module";
import Subscription from "../models/subscription.model.js";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

import dayjs from "dayjs";
import { sendReminderEmail } from "../utils/send-email.js";
import { now } from "mongoose";

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
    const {subscriptionId} = context.requestPayload;

    const subscription = await fetchSubscriptions(context, subscriptionId);

    if(!subscription || subscription.status !== 'active') return;

    const renawalDate = dayjs(subscription.renewalDate);

    if(renawalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow`);
        return;
    }

    for(const dayBefore of REMINDERS) {
        const reminderDate = renawalDate.subtract(dayBefore, 'day');

        if(reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${dayBefore} days before`, reminderDate);
        }

        if(dayjs().isSame(reminderDate, 'day')) {
            await triggerReminder(context, `${dayBefore} days before reminder`, subscription);
        }

    }

});

const fetchSubscriptions = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
};

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Trigerring ${label} reminder`);

        // Send email, SMS, push notification etc
        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        })
    });
}