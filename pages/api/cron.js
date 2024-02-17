export default function handler(req, res) {
    console.log("Cron job: fetch latest pantry data run")

    const { body } = req;

    return new Promise((resolve, reject) =>  {
        let spawn = require("child_process").spawn;

        let process = spawn("python3", [
            "utils/fetchLatestPantryData.py"
        ])

        res.status(200).end("Cron job: fetch latest pantry data completed");
        resolve();
    })
}