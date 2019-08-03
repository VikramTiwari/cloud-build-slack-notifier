// Courtesy of https://cloud.google.com/cloud-build/docs/configure-third-party-notifications
const IncomingWebhook = require('@slack/client').IncomingWebhook

if (
  process.env.SLACK_WEBHOOK_URL === undefined ||
  process.env.SLACK_WEBHOOK_URL === null
) {
  console.log('Please specify SLACK_WEBHOOK_URL in environment variables')
  process.exit(1)
}

if (process.env.GITHUB_ID === undefined || process.env.GITHUB_ID === null) {
  console.log('Please specify GITHUB_ID in environment variables')
  process.exit(1)
}

const statusMap = {
  SUCCESS: 'Success',
  FAILURE: 'Failure',
  QUEUED: 'Queued',
  WORKING: 'Working',
  INTERNAL_ERROR: 'Internal Error',
  TIMEOUT: 'Timeout',
  CANCELLED: 'Cancelled'
}

const statusColorMap = {
  SUCCESS: '#36A64F',
  FAILURE: '#FF5252',
  QUEUED: '#BBDEFB',
  WORKING: '#D4E157',
  INTERNAL_ERROR: '#FFD54F',
  TIMEOUT: '#FFB74D',
  CANCELLED: '#EEEEEE'
}

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = data => {
  return JSON.parse(new Buffer.from(data, 'base64').toString('utf-8'))
}

// createSlackMessage create a message from a build object.
const createSlackMessage = build => {
  const message = {
    text: `Build ${statusMap[build.status]}`,
    mrkdwn: true,
    attachments: [
      {
        title: 'Commit',
        title_link: `https://github.com/${process.env.GITHUB_ID}/${
          build.substitutions.REPO_NAME
        }/commit/${build.substitutions.COMMIT_SHA}`,
        color: statusColorMap[build.status],
        fields: [
          {
            title: 'Repo',
            value: build.substitutions.REPO_NAME
          },
          {
            title: 'Branch',
            value: build.substitutions.BRANCH_NAME
          }
        ]
      },
      {
        title: 'Build',
        title_link: build.logUrl,
        color: statusColorMap[build.status],
        fields: []
      }
    ]
  }
  if (build.substitutions.TAG_NAME && build.substitutions.TAG_NAME !== '') {
    message.attachments[0].fields.push({
      title: 'Tag',
      value: build.substitutions.TAG_NAME
    })
  }
  for (let index = 0; index < build.steps.length; index++) {
    const step = build.steps[index]
    message.attachments[1].fields.push({
      title: step.name,
      value: statusMap[step.status]
    })
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
