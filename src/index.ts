#!/usr/bin/env node

import { $, echo, question, sleep } from 'zx';
import { Octokit } from 'octokit';
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';

(async () => {
  $.verbose = false;
  console.clear();

  echo`\n✨✨ Welcome to the Soul Refiner application process ✨✨\n`;

  const position = await question(
    'Which position are you applying for today?\n1. Senior DevOps\n2. Backend Engineer\n\nEnter 1/2: ',
    { choices: ['1', '2'] }
  );

  /**
   * @todo enter REPOSITORY here and CONTACT INFO here
   */
  if (position === '1') {
    echo`Please familiarize yourself with this repo prior to your interview\n`;
    echo`If you do not have an interview, please contact our recuiter at \n`;

    echo`Have a blessed day!`;
  } else if (position === '2') {
    console.clear();
    echo`🛑🛑 Attention 🛑🛑`;
    echo`\nThis assignment tool will:\n`;
    echo` - log you into your GitHub account\n - create a repository for you (with some starter code)\n - create a pull request for you to review`;

    echo`\nYour task is to do a code review on that pull request\n`;

    const proceed = await question('Do you wish to proceed?\n\nEnter y/n: ');
    if (proceed === 'n') return;

    const auth = createOAuthDeviceAuth({
      clientId: '797fc7c2acb5f7c1bed3',
      scopes: ['public_repo'],
      async onVerification({ verification_uri, user_code }) {
        echo`Open: ${verification_uri}\n`;
        echo`❗❗  Paste code: ${user_code}  ❗❗\n`;

        await question('Press <enter> when ready');
      },
    });

    try {
      const { token } = await auth({ type: 'oauth' });
      const octokit = new Octokit({ auth: token });
      console.clear();

      echo`Successfully logged into GitHub`;

      sleep(2);

      echo`Creating a repo...`;

      const repo = await octokit.rest.repos.createFork({
        owner: 'ben-at-soul-refiner',
        repo: 'express-template',
        name: 'soul-refiner-assessment',
      });

      if (repo.status !== 202) {
        echo`GitHub failed to make a repo. Please ensure you are logged in and that you have no other repos named "soul-refiner-assessment"`;
        return;
      }

      echo`Creating a pull request...`;

      let PR_RETRIES = 6;
      const owner = 'b-a-merritt';

      while (PR_RETRIES > 0) {
        try {
          const pr = await octokit.request(
            `POST /repos/${owner}/soul-refiner-assessment/pulls`,
            {
              owner: owner,
              repo: 'soul-refiner-assessment',
              title: `Pull request for ${owner} to review`,
              body: 'Please review this pull request to continue with your application process',
              head: 'b-a-merritt:pullrequest',
              base: 'main',
              headers: {
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          );

          if (pr.status === 201) {
            echo`\n✅✅ Success! ✅✅\n`;
            echo`Please complete your code review at:\n${pr.data.html_url}`;
            break;
          } else {
            setTimeout(() => {
              PR_RETRIES--;
            }, 5000);
          }
        } catch (error) {
          setTimeout(() => {
            PR_RETRIES--;
          }, 5000);
          if (PR_RETRIES === 0)
            echo`Failed to create pull request. Please go to your GitHub account, create the PR, and do the code review on that PR`;
        }
      }
    } catch (error) {
      echo`GitHub failed to authenticate. Please ensure you logging into the correct account`;
      console.log(error);
    }
  }
})();
