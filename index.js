#!/usr/bin/env node

const execa = require('execa')
const { join } = require('path')
const { homedir } = require('os')
const chalk = require('chalk')
const prompt = require('prompts')
const { ConditionalCatch } = require('conditional-catch')

const { fileExistsAsync, readFileAsJsonAsync } = require('./helper')
const defaultKFile = require('./default-kfile')

const kFileName = '.kfile.json'
const kubectlExecutable = 'kubectl'
const kubectlConfigParameter = '--kubeconfig'

async function readConfigurationFromHomeDirectory () {
  const path = join(homedir(), kFileName)
  const kFileExists = await fileExistsAsync(path)

  if (!kFileExists) {
    throw new Error(`Configuration file not found at ${path}`)
  }

  return readFileAsJsonAsync(path)
}

function expandShorthands (kubeArguments, kFile) {
  return kubeArguments
    .reduce((acc, next) => [...acc, ...(kFile.shorthands[next] || [next])], [])
}

function parseCommandLineArgsFrom (argv, kFile) {
  // First two are not needed, since they contain the
  // executable- and filename
  if (argv.length <= 2) throw new Error('No environment name provided')

  const environmentName = argv[2]
  const kubeArguments = expandShorthands(argv.splice(3), kFile)

  return {
    environmentName,
    kubeArguments
  }
}

const runAsync = async (argv) => {
  const kFile = Object.assign({}, defaultKFile, await readConfigurationFromHomeDirectory())
  const { environmentName, kubeArguments } = parseCommandLineArgsFrom(argv, kFile)

  if (!Object.keys(kFile.environments).includes(environmentName)) {
    throw new Error(`Environment "${environmentName}" not found in kfile`)
  }

  const environment = kFile.environments[environmentName]
  console.log(chalk.green(`[k] Choosen environment '${environmentName}'`))

  if (environment.requiresConfirmation) {
    const { confirmed } = await prompt({
      type: 'confirm',
      name: 'confirmed',
      message: `Please confirm the you want to execute "${chalk.blue(kubeArguments.join(' '))}" on ${chalk.red(environmentName)}`,
      initial: false
    })
    if (!confirmed) {
      return
    }
  }

  try {
    await execa(kubectlExecutable, [ kubectlConfigParameter, environment.kubeconfig, ...kubeArguments ], {
      stderr: process.stderr,
      stdin: process.stdin,
      stdout: process.stdout
    })
  } catch (err) {
    ConditionalCatch.createFrom(err)
      .when(e => e.failed, () => {})
      .handleOrThrow()
  }
}

runAsync(process.argv)
  .catch(err => {
    console.error(chalk.red(`[k] errored with: ${err.message}`))
    console.log(Object.keys(err).join(', '))

    process.exit(err.code || 1)
  })
