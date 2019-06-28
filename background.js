function buildSuggestions(searchResults, folderTreeRoot) {
  let suggestions = []

  searchResults.forEach(bookmark => {
    if (typeof bookmark.url !== 'undefined' && folderTreeRoot.getChildById(bookmark.parentId).isSearchable()) {
      suggestions.push({
        content: bookmark.url,
        description: bookmark.title,
      })
    }
  })

  return suggestions
}

async function setupInputListener() {
  const config = await loadConfig(DEFAULT_CONFIG)
  const bookmarksTreeNode = await browser.bookmarks.getTree()
  const folderTreeRoot = FolderTreeNode.buildFromBookmarksTreeNode(bookmarksTreeNode[0], config.selectedFolderIds)

  if (inputListener != null && browser.omnibox.onInputChanged.hasListener(inputListener)) {
    browser.omnibox.onInputChanged.removeListener(inputListener)
  }

  inputListener = (text, addSuggestions) => {
    browser.bookmarks.search(text).then(searchResults => {
      return new Promise(resolve => {
        resolve(buildSuggestions(searchResults, folderTreeRoot))
      })
    }).then(addSuggestions)
  }

  browser.omnibox.onInputChanged.addListener(inputListener)
}


// Setup inputListener & add listeners to reset it in case of bookmarks or storage updates
var inputListener = null // Used to keep track of previous listener when update
setupInputListener()
browser.bookmarks.onCreated.addListener(setupInputListener)
browser.bookmarks.onChanged.addListener(setupInputListener)
browser.bookmarks.onRemoved.addListener(setupInputListener)
browser.storage.onChanged.addListener(setupInputListener)

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  switch (disposition) {
    case "currentTab":
      browser.tabs.update({url})
      break
    case "newForegroundTab":
      browser.tabs.create({url})
      break
    case "newBackgroundTab":
      browser.tabs.create({url, active: false})
      break
    }
})