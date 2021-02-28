import process from 'child_process';
import { Logger } from '../../common/logger';

// Mainly ripped from https://raw.githubusercontent.com/seymen/git-last-commit/master/source/index.js
// All credit due to https://github.com/seymen
export class GitRatchet {
  private static readonly SPLIT_CHARACTER: string = '<##>';
  private static readonly PRETTY_FORMAT: string[] = ['%h', '%H', '%s', '%f', '%b', '%at', '%ct', '%an', '%ae', '%cn', '%ce', '%N', ''];

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static async executeCommand(command: string, options: any): Promise<string> {
    let dst: string = __dirname;

    if (!!options && !!options.dst) {
      dst = options.dst;
    }

    return new Promise<string>((res, rej) => {
      process.exec(command, { cwd: dst }, (err, stdout, stderr) => {
        if (stdout === '') {
          rej('this does not look like a git repo');
        }

        if (!!stderr) {
          rej(stderr);
        }

        res(stdout);
      });
    });
  }

  private static getCommandString(splitChar: string): string {
    return (
      'git log -1 --pretty=format:"' +
      GitRatchet.PRETTY_FORMAT.join(splitChar) +
      '"' +
      ' && git rev-parse --abbrev-ref HEAD' +
      ' && git tag --contains HEAD'
    );
  }

  public static async getLastCommitSwallowException(options: any = {}): Promise<GitCommitData> {
    let rval: GitCommitData = null;
    try {
      rval = await this.getLastCommit(options);
    } catch (err) {
      Logger.warn('Failed to fetch git data : %s', err, err);
    }
    return rval;
  }

  public static async getLastCommit(options: any = {}): Promise<GitCommitData> {
    const command: string = GitRatchet.getCommandString(GitRatchet.SPLIT_CHARACTER);

    const res: string = await GitRatchet.executeCommand(command, options);

    const a: string[] = res.split(GitRatchet.SPLIT_CHARACTER);

    // e.g. master\n or master\nv1.1\n or master\nv1.1\nv1.2\n
    const branchAndTags: string[] = a[a.length - 1].split('\n').filter((n) => n);
    const branch: string = branchAndTags[0];
    const tags: string[] = branchAndTags.slice(1);

    const rval: GitCommitData = {
      shortHash: a[0],
      hash: a[1],
      subject: a[2],
      sanitizedSubject: a[3],
      body: a[4],
      authoredOn: a[5],
      committedOn: a[6],
      author: {
        name: a[7],
        email: a[8],
      },
      committer: {
        name: a[9],
        email: a[10],
      },
      notes: a[11],
      branch,
      tags,
    };
    return rval;
  }
}

export interface GitCommitData {
  shortHash: string;
  hash: string;
  subject: string;
  sanitizedSubject: string;
  body: string;
  authoredOn: string;
  committedOn: string;
  author: GitCommitDataPerson;
  committer: GitCommitDataPerson;
  notes: string;
  branch: string;
  tags: string[];
}

export interface GitCommitDataPerson {
  name: string;
  email: string;
}
