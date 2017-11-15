// Beim ersten Login auszuführen um Nutzer anzulegen

module.exports = (username, password) => {
  // Shellscripte ausführen, wie z.B einen Nutzer anlegen, Gitlab anlegen, DB anlegen etc.

    const { spawn } = require('child_process');


    //User wird angelegt und ein Home verzeichnis erstellt, Passwort wird über echo in passwd gepiped
    // -S gibt an, dass der Input stdio ist
    // TODO: Eleganter als mit echo lösen
    const child = spawn(
        'useradd -d /home/' + username + ' -m ' + username +
        ' && echo ' + password + ' | passwd -S ' + username ,
        {
            stdio: 'inherit',
            shell: true
        }
    );

    child.on('message', (msg) => {
        console.log(msg);
    })

};