# Cloud Build Slack Notifier

This is built using source code posted here: https://cloud.google.com/cloud-build/docs/configure-third-party-notifications

## Setup

- [Setup a webhook and get the webhook URL](https://get.slack.help/hc/en-us/articles/115005265063-Incoming-WebHooks-for-Slack)
- Get your GitHub Id. It's generally the value in the URL right after `github.com/`. For example, my GitHub Id is `VikramTiwari`
- Replace the variables and deploy to cloud functions

```sh
gcloud functions deploy cloud-build-slack-notifier --trigger-topic cloud-builds --runtime=nodejs10 --memory=128MB --set-env-vars SLACK_WEBHOOK_URL=<REPLACE_WITH_YOUR_SLACK_WEBHOOK_URL>,GITHUB_ID=<URL_SLUG_FOR_YOUR_OR_ORG_USERNAME>
```

Enjoy!
