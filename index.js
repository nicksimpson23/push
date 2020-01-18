const octokit = require('@octokit/rest');
const fs = require('fs');
const mkdir = require('mkdirp');
const Path = require('path');

const username = "name of repo. owner";
const user = octokit({
	auth: "personal access token"
});

// writes files
async function write(path, content) {
	path = Path.resolve(__dirname, path);

	let directory = path.split('/');
	directory.pop();
	directory = directory.join('/');

	await mkdir(directory);
	fs.writeFile(path, content, (err) => {
		if (err) throw Error(err);
	});
};

// recursively builds file system
async function build(src, path="") {

	let repo = await user.repos.getContents({
		owner: username,
		repo: src,
		path: path
	});
	let data = repo.data;

	for (let item of data) {
		if (item.type == "file") {
			let file = await user.repos.getContents({
				owner: username,
				repo: src,
				path: item.path
			});
			let content = Buffer.from(file.data.content, 'base64').toString();
			write(item.path, content);
		} else if (item.type == "dir") {
			build(src, item.path);
		};
	};
};

function init(src, interval=300000) {
	if (!src) throw Error("provide src");
	build(src);
	setInterval(() => {
		build(src);
	}, interval);
};

init("repository name", 300000);