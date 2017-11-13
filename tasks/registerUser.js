// Beim ersten Login auszuführen um Nutzer anzulegen

module.exports = (user) => {
  // Shellscripte ausführen, wie z.B einen Nutzer anlegen, Gitlab anlegen, DB anlegen etc.

    const { spawn } = require('child_process');


    //TODO: User anlegen
    const child = spawn(
        'ls -l',
        {
            stdio: 'inherit',
            shell: true
        }
    );

    child.on('message', (msg) => {
        console.log(msg);
    })

};