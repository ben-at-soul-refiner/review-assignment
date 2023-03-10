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
    $`clear`;
    echo`\nThis assignment will log you into your GitHub account\n`;

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

      const repo = await octokit.rest.repos.createUsingTemplate({
        name: 'soul-refiner-assessment',
        template_owner: 'sindresorhus',
        template_repo: 'electron-boilerplate',
        private: false,
        include_all_branches: true,
      });

      if (repo.status !== 201) {
        echo`GitHub failed to make a repo. Please ensure you are logged in and that you have no other repos named "soul-refiner-assessment"`;
        return;
      }

      echo`Creating a pull request...`;

      sleep(4);

      const repoName = repo.data.name;
      const owner = repo.data.owner.login;

      const pr = await octokit.rest.pulls.create({
        repo: repoName,
        base: 'main',
        head: 'pullrequest',
        owner: owner,
        title: `Pull request for ${owner} to review`,
        body: 'Please review this pull request to continue with your application process',
      });

      console.log(pr);
    } catch (error) {
      echo`GitHub failed to authenticate. Please ensure you logging into the correct account`;
      console.log(error);
    }
  }
})();
