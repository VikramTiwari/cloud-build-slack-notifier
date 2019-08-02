// Courtesy of https://cloud.google.com/cloud-build/docs/configure-third-party-notifications
const IncomingWebhook = require('@slack/client').IncomingWebhook

if (
  process.env.SLACK_WEBHOOK_URL === undefined ||
  process.env.SLACK_WEBHOOK_URL === null
) {
  console.log('Please specify SLACK_WEBHOOK_URL in environment variables')
  process.exit(1)
}

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = data => {
  return JSON.parse(new Buffer.from(data, 'base64').toString('utf-8'))
}

// createSlackMessage create a message from a build object.
const createSlackMessage = build => {
  let message = {
    text: `Build \`${build.id}\``,
    mrkdwn: true,
    attachments: [
      {
        title: 'Build logs',
        title_link: build.logUrl,
        fields: [
          {
            title: 'Status',
            value: build.status
          }
        ]
      }
    ]
  }
  return message
}

// subscribe is the main function called by Cloud Functions.
module.exports.cloudBuildSlackNotifier = (event, callback) => {
  const build = eventToBuild(event.data)

  // Skip if the current status is not in the status list.
  // Add additional statues to list if you'd like:
  // QUEUED, WORKING, SUCCESS, FAILURE,
  // INTERNAL_ERROR, TIMEOUT, CANCELLED
  const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT']
  if (status.indexOf(build.status) === -1) {
    return callback()
  }

  // Send message to Slack.
  const message = createSlackMessage(build)
  webhook.send(message, callback)
}
