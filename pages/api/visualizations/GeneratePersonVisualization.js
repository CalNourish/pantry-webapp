export default async function (req, res) {
    const { body } = req;

    return new Promise((resolve, reject) =>  {
        let spawn = require("child_process").spawn;
        let finalData = ""

        let process = spawn("python3", [
            "utils/generatePersonVisualization.py",
            req.query.weekHistory,
            req.query.onWeekday
        ])

        process.stdout.on("data", (data) => {
            finalData += data.toString()
        })

        process.stdout.on("end", () => {
            console.log("All data received")
            res.status(200).json({ requested: finalData })
            res.end()
        })

        process.stderr.on("data", (data) => {
            res.status(200).json({ err: data.toString() })
            res.end()
        })

        resolve();
    })
}