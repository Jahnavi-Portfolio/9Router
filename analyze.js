const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function analyzeCodebase() {
    try {
        // Get all tracked files
        const filesOutput = execSync('git ls-files', { encoding: 'utf-8' });
        const allFiles = filesOutput.split('\n').filter(f => f.trim().length > 0);
        
        let stats = {
            totalFiles: allFiles.length,
            extensions: {},
            totalLines: 0,
            fileList: []
        };
        
        for (const file of allFiles) {
            const ext = path.extname(file) || 'no_extension';
            stats.extensions[ext] = (stats.extensions[ext] || 0) + 1;
            
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const lines = content.split('\n').length;
                stats.totalLines += lines;
                
                // For JS/TS files, let's just get a very brief summary of size
                stats.fileList.push({
                    file,
                    lines,
                    sizeBytes: Buffer.byteLength(content, 'utf8')
                });
            } catch (e) {
                // binary files or errors
                stats.fileList.push({ file, lines: 0, error: 'Could not read text' });
            }
        }
        
        // Sort files by lines descending
        stats.fileList.sort((a, b) => b.lines - a.lines);
        
        fs.writeFileSync('codebase_analysis_report.json', JSON.stringify(stats, null, 2));
        console.log(`Analyzed ${stats.totalFiles} files. Total lines: ${stats.totalLines}`);
        
    } catch (e) {
        console.error('Error analyzing:', e);
    }
}

analyzeCodebase();
