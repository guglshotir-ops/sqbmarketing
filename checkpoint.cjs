const { execSync } = require('child_process');

function run(cmd) {
    try {
        return execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        // console.error(`Error running command: ${cmd}`);
    }
}

const now = new Date();
const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
const message = process.argv[2] ? `Checkpoint: ${process.argv[2]}` : `Checkpoint: Auto-save ${timestamp}`;

console.log(`\n💾 Сохранение текущей версии: ${timestamp}...`);

run('git add .');
run(`git commit -m "${message}"`);

console.log('✅ Версия сохранена! Теперь вы можете безопасно вносить изменения.\n');
console.log('💡 Если что-то пойдет не так, используйте: git reset --hard HEAD');
