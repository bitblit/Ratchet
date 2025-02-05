import { execSync } from 'child_process';

// Custom Rollup plugin to run Angular AOT
export default function angularAotPlugin() {
  return {
    name: 'angular-aot-rollup-plugin',
    buildStart() {
      console.log('Running Angular AOT Compilation...');
      try {
        execSync('ngc -p tsconfig.json', { stdio: 'inherit' });
      } catch (error) {
        this.error('AOT Compilation failed.', error);
      }
    },
  };
}

//module.exports = angularAotPlugin;
