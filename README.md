# Cloud Build Slack Notifier

This is built using source code posted here: https://cloud.google.com/cloud-build/docs/configure-third-party-notifications

## Setup

- [Setup a webhook and get the webhook URL](https://get.slack.help/hc/en-us/articles/115005265063-Incoming-WebHooks-for-Slack)
- Replace the webhook URL and deploy to cloud functions

```sh
gcloud functions deploy cloud-build-slack-notifier --trigger-topic cloud-builds --runtime=nodejs10 --set-env-vars SLACK_WEBHOOK_URL=<REPLACE_WITH_YOUR_SLACK_WEBHOOK_URL>
```

Enjoy!
