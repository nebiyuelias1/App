const utils = require('../utils/utils');

const assertValidateActorJobExecuted = (workflowResult, actor = 'Dummy Actor', pullRequestNumber = '1234', didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Is team member',
            true,
            null,
            'VALIDATEACTOR',
            'Is team member',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'username', value: actor}, {key: 'team', value: 'Expensify/expensify'}],
            [],
        ),
        utils.getStepAssertion(
            'Set HAS_READY_TO_BUILD_LABEL flag',
            true,
            null,
            'VALIDATEACTOR',
            'Set HAS_READY_TO_BUILD_LABEL flag',
            [],
            [{key: 'PULL_REQUEST_NUMBER', value: pullRequestNumber}, {key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};
const assertGetBranchRefJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'GETBRANCHREF',
            'Checkout',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Check if pull request number is correct',
            true,
            null,
            'GETBRANCHREF',
            'Check if pull request number is correct',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};
const assertAndroidJobExecuted = (workflowResult, ref = '', didExecute = true, failsAt = -1) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'ANDROID',
            'Checkout',
            [{key: 'ref', value: ref}],
            [],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'ANDROID',
            'Setup Node',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Setup Ruby',
            true,
            null,
            'ANDROID',
            'Setup Ruby',
            [{key: 'ruby-version', value: '2.7'}, {key: 'bundler-cache', value: true}],
            [],
        ),
        utils.getStepAssertion(
            'Decrypt keystore',
            true,
            null,
            'ANDROID',
            'Decrypt keystore',
            [],
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Decrypt json key',
            true,
            null,
            'ANDROID',
            'Decrypt json key',
            [],
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'ANDROID',
            'Configure AWS Credentials',
            [{key: 'AWS_ACCESS_KEY_ID', value: '***'}, {key: 'AWS_SECRET_ACCESS_KEY', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Run Fastlane beta test',
            true,
            null,
            'ANDROID',
            'Run Fastlane beta test',
            [],
            [
                {key: 'S3_ACCESS_KEY', value: '***'},
                {key: 'S3_SECRET_ACCESS_KEY', value: '***'},
                {key: 'S3_BUCKET', value: 'ad-hoc-expensify-cash'},
                {key: 'S3_REGION', value: 'us-east-1'},
            ],
        ),
        utils.getStepAssertion(
            'Upload Artifact',
            true,
            null,
            'ANDROID',
            'Upload Artifact',
            [{key: 'name', value: 'android'}, {key: 'path', value: './android_paths.json'}],
            [],
        ),
    ];

    for (const [i, expectedStep] of steps.entries()) {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                expectedStep.status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};
const assertIOSJobExecuted = (workflowResult, ref = '', didExecute = true, failsAt = -1) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'IOS',
            'Checkout',
            [{key: 'ref', value: ref}],
            [],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'IOS',
            'Setup Node',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Setup Ruby',
            true,
            null,
            'IOS',
            'Setup Ruby',
            [{key: 'ruby-version', value: '2.7'}, {key: 'bundler-cache', value: true}],
            [],
        ),
        utils.getStepAssertion(
            'Install cocoapods',
            true,
            null,
            'IOS',
            'Install cocoapods',
            [
                {key: 'timeout_minutes', value: '10'},
                {key: 'max_attempts', value: '5'},
                {key: 'command', value: 'cd ios && pod install'},
            ],
            [],
        ),
        utils.getStepAssertion(
            'Decrypt profile',
            true,
            null,
            'IOS',
            'Decrypt profile',
            [],
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Decrypt certificate',
            true,
            null,
            'IOS',
            'Decrypt certificate',
            [],
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'IOS',
            'Configure AWS Credentials',
            [{key: 'AWS_ACCESS_KEY_ID', value: '***'}, {key: 'AWS_SECRET_ACCESS_KEY', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Run Fastlane',
            true,
            null,
            'IOS',
            'Run Fastlane',
            [],
            [
                {key: 'S3_ACCESS_KEY', value: '***'},
                {key: 'S3_SECRET_ACCESS_KEY', value: '***'},
                {key: 'S3_BUCKET', value: 'ad-hoc-expensify-cash'},
                {key: 'S3_REGION', value: 'us-east-1'},
            ],
        ),
        utils.getStepAssertion(
            'Upload Artifact',
            true,
            null,
            'IOS',
            'Upload Artifact',
            [{key: 'name', value: 'ios'}, {key: 'path', value: './ios_paths.json'}],
            [],
        ),
    ];

    for (const [i, expectedStep] of steps.entries()) {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                expectedStep.status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};
const assertDesktopJobExecuted = (workflowResult, ref = '', didExecute = true, failsAt = -1) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'DESKTOP',
            'Checkout',
            [{key: 'ref', value: ref}, {key: 'fetch-depth', value: '0'}],
            [],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'DESKTOP',
            'Setup Node',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Decrypt Developer ID Certificate',
            true,
            null,
            'DESKTOP',
            'Decrypt Developer ID Certificate',
            [],
            [{key: 'DEVELOPER_ID_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'DESKTOP',
            'Configure AWS Credentials',
            [{key: 'AWS_ACCESS_KEY_ID', value: '***'}, {key: 'AWS_SECRET_ACCESS_KEY', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Build desktop app for testing',
            true,
            null,
            'DESKTOP',
            'Build desktop app for testing',
            [],
            [
                {key: 'CSC_LINK', value: '***'},
                {key: 'CSC_KEY_PASSWORD', value: '***'},
                {key: 'APPLE_ID', value: '***'},
                {key: 'APPLE_ID_PASSWORD', value: '***'},
                {key: 'AWS_ACCESS_KEY_ID', value: '***'},
                {key: 'AWS_SECRET_ACCESS_KEY', value: '***'},
            ],
        ),
    ];

    for (const [i, expectedStep] of steps.entries()) {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                expectedStep.status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};
const assertWebJobExecuted = (workflowResult, ref = '', didExecute = true, failsAt = -1) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'WEB',
            'Checkout',
            [{key: 'fetch-depth', value: '0'}, {key: 'ref', value: ref}],
            [],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'WEB',
            'Setup Node',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'WEB',
            'Configure AWS Credentials',
            [{key: 'AWS_ACCESS_KEY_ID', value: '***'}, {key: 'AWS_SECRET_ACCESS_KEY', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Build web for testing',
            true,
            null,
            'WEB',
            'Build web for testing',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Build docs',
            true,
            null,
            'WEB',
            'Build docs',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Deploy to S3 for internal testing',
            true,
            null,
            'WEB',
            'Deploy to S3 for internal testing',
            [],
            [],
        ),
    ];

    for (const [i, expectedStep] of steps.entries()) {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                // either whole job is successful, or steps up to this point are successful
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                // this is the failing step
                expectedStep.status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                // steps after failed one do not execute
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};
const assertPostGithubCommentJobExecuted = (workflowResult, ref = '', pullRequestNumber = '1234', didExecute = true, androidStatus = 'success', iOSStatus = 'success', desktopStatus = 'success', webStatus = 'success') => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'POSTGITHUBCOMMENT',
            'Checkout',
            [{key: 'ref', value: ref}],
            [],
        ),
        utils.getStepAssertion(
            'Download Artifact',
            true,
            null,
            'POSTGITHUBCOMMENT',
            'Download Artifact',
            [],
            [],
        ),
    ];
    if (androidStatus === 'success') {
        steps.push(
            utils.getStepAssertion(
                'Read JSONs with android paths',
                true,
                null,
                'POSTGITHUBCOMMENT',
                'Read JSONs with android paths',
                [],
                [],
            ),
        );
    }
    if (iOSStatus === 'success') {
        steps.push(
            utils.getStepAssertion(
                'Read JSONs with iOS paths',
                true,
                null,
                'POSTGITHUBCOMMENT',
                'Read JSONs with iOS paths',
                [],
                [],
            ),
        );
    }
    steps.push(
        utils.getStepAssertion(
            'maintain-comment',
            true,
            null,
            'POSTGITHUBCOMMENT',
            'maintain-comment',
            [
                {key: 'token', value: '***'},
                {key: 'body-include', value: 'Use the links below to test this build in android and iOS. Happy testing!'},
                {key: 'number', value: pullRequestNumber},
                {key: 'delete', value: true},
            ],
            [],
        ),
        utils.getStepAssertion(
            'Publish links to apps for download',
            true,
            null,
            'POSTGITHUBCOMMENT',
            'Publish links to apps for download',
            [
                {key: 'PR_NUMBER', value: pullRequestNumber},
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'ANDROID', value: androidStatus},
                {key: 'DESKTOP', value: desktopStatus},
                {key: 'IOS', value: iOSStatus},
                {key: 'WEB', value: webStatus},
                {key: 'ANDROID_LINK', value: androidStatus === 'success' ? 'http://dummy.android.link' : ''},
                {key: 'DESKTOP_LINK', value: `https://ad-hoc-expensify-cash.s3.amazonaws.com/desktop/${pullRequestNumber}/NewExpensify.dmg`},
                {key: 'IOS_LINK', value: iOSStatus === 'success' ? 'http://dummy.ios.link' : ''},
                {key: 'WEB_LINK', value: `https://${pullRequestNumber}.pr-testing.expensify.com`},
            ],
            [],
        ),
    );

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};

module.exports = {
    assertValidateActorJobExecuted,
    assertGetBranchRefJobExecuted,
    assertAndroidJobExecuted,
    assertIOSJobExecuted,
    assertDesktopJobExecuted,
    assertWebJobExecuted,
    assertPostGithubCommentJobExecuted,
};
