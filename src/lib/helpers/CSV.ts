import Reader from "./FileReader"

/*
    Tried determining the encoding with jschardet & checking the UTF-BOM, but the effort to transform
    the file into the correct format is to big at the moment. For now, remove the double quotes & quotes
    on the beginning and ending of a line. This was set if the user saves a file with a line like the following "test, test"
    into UTF-8.

    Example:
    name,lastname
    Pol,"Von, Paulen"

    Would become:
    name,lastname
    "Pol, ""Von, Paulen"""

    So this resets is to the original form
*/

export default class CSV {
    // Must not be ASCII encoded & also not be UTF-8
    // ASCII = MS DOS or MAC
    // In UTF-8 "," is a seperator so this messes up the working of the table
    // It must be a seperatorList encoded CSV file
    static async isValid(file: File): Promise<{file: File, valid: boolean}> {
        file = await this.fixPossibleFileIssues(file)
        return { file, valid: true }
    }

    private static async fixPossibleFileIssues(file: File): Promise<File> {
        const text = await Reader.readFileAsText(file)
        if (!text) throw Error('Could not read the file')
        const updatedText = await this.fixInvalidCSV(text)
        const updatedFile = await this.textToFile(updatedText, file.name, 'text/csv')
        return updatedFile
    }

    private static async fixInvalidCSV(text: string): Promise<string> {
        text = text.replaceAll("\n\"", '\n')
        text = text.replaceAll("\"\n", "\n")
        text = text.replaceAll("\"\t", "\t")
        text = text.replaceAll("\"\r", "\r")
        text = text.replaceAll("\"\"", "\"")
        return text
    }

    private static async textToFile(text: string, name: string, type: string): Promise<File> {
        const encodedText = text
        const blob = new Blob([encodedText], { type })
        return new File([blob], name, { type })
    }
}