export default async function (req, res) {
    const { body } = req;

    return new Promise((resolve, reject) =>  {
        let spawn = require("child_process").spawn;
        let finalData = ""

        let process = spawn("python3", [
            "utils/generatePPDVisualization.py",
            req.query.weekHistory,
            req.query.onWeekday
        ])

        process.stdout.on("data", (data) => {
            finalData += data.toString()
        })

        process.stdout.on("end", () => {
            return res.status(200).json({ requested: finalData })
        })

        process.stderr.on("data", (data) => {
            return res.status(200).json({ err: data.toString() })
        })

        resolve();
    })
}

export const config = {
    api: {
      externalResolver: true,
    },
}