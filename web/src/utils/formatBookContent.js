const fs = require('fs');
const path = require('path');

// Add debug logging
console.log('Script started');
console.log('Current directory:', process.cwd());

const formatText = (text) => {
    console.log('Formatting text...');
    
    // Extract the front matter and main content
    const [frontMatter, ...mainContent] = text.split(/Chapter 1:/);
    
    // Process the main content
    const processedContent = mainContent.join('Chapter 1:') // Rejoin in case of split issues
        .split(/(?=Chapter \d+:)/)  // Split on chapter starts
        .map(chapter => {
            // Process sections within chapters
            return chapter.split(/(?=Section \d+:)/).map(section => {
                const lines = section.split('\n').filter(line => line.trim());
                const title = lines[0];
                const content = lines.slice(1).join('\n\n');
                return { title, content };
            });
        });

    // Format the front matter
    const formattedFrontMatter = frontMatter
        .split('\n')
        .filter(line => line.trim())
        .join('\n\n');

    return [
        { title: "Front Matter", content: formattedFrontMatter },
        ...processedContent.flat()
    ];
};

// Update the source file path to point to the correct location
const sourceFile = path.join(__dirname, '../data/books/Capital-Volume-I.txt');
console.log('Source file path:', sourceFile);

const targetDir = path.join(__dirname, '../data/books/1');
console.log('Target directory:', targetDir);

// Create directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
    console.log('Creating target directory...');
    fs.mkdirSync(targetDir, { recursive: true });
}

try {
    // Read and process the file
    console.log('Reading file...');
    const text = fs.readFileSync(sourceFile, 'utf-8');
    console.log('File read successfully, length:', text.length);
    
    const formattedContent = formatText(text);
    console.log('Content formatted successfully');

    // Create the content.json file
    const bookData = {
        id: 1,
        title: "Capital, Volume I",
        author: "Karl Marx",
        year: 1867,
        content: formattedContent,
        totalPages: formattedContent.length,
        metadata: {
            language: "English",
            translator: "Samuel Moore and Edward Aveling",
            originalTitle: "Das Kapital. Kritik der politischen Ökonomie",
            firstPublished: 1867,
            source: "Progress Publishers, Moscow, USSR"
        }
    };

    console.log('Writing output file...');
    fs.writeFileSync(
        path.join(targetDir, 'content.json'),
        JSON.stringify(bookData, null, 2)
    );
    console.log('Process completed successfully');
} catch (error) {
    console.error('Error:', error);
}