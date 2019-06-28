function buildBookmarksOptions(folderTreeNode, selectTag, depth=0) {
  const option = document.createElement('option')
  
  title = (folderTreeNode.parent == null) ?
  'All' : folderTreeNode.title
  
  option.value = folderTreeNode.id
  option.innerText = '-- '.repeat(depth) + title
  option.selected = folderTreeNode.isSelected
  
  selectTag.appendChild(option)
  
  folderTreeNode.children.forEach(childNode => {
    buildBookmarksOptions(childNode, selectTag, depth + 1)
  })
  
  if (folderTreeNode.parent == null) {
    selectTag.size = selectTag.options.length
  }
}

const DOM = {
  selectFolders: document.getElementById('select-folders')
}

loadConfig(DEFAULT_CONFIG).then(config => {
  browser.bookmarks.getTree().then(bookmarksTreeNode => {
    const folderTreeRoot = FolderTreeNode.buildFromBookmarksTreeNode(
      bookmarksTreeNode[0],
      config.selectedFolderIds
    )

    // Initialize form 
    buildBookmarksOptions(folderTreeRoot, DOM.selectFolders)
    
    // Force correct selection on DOM.selectFolders
    DOM.selectFolders.addEventListener('change', event => {
      if (event.explicitOriginalTarget.selected) {
        const familyIds = folderTreeRoot.getChildById(event.explicitOriginalTarget.value).getFamilyIds()
        const selectedOptions = Array.prototype.slice.call(DOM.selectFolders.selectedOptions)
        
        for (let option of selectedOptions) {
          if (option.selected && familyIds.indexOf(option.value) != -1) {
            option.selected = false
          }
        }
      }
    })
  })
})

// Save config modifications
document.forms[0].addEventListener('submit', event => {
  event.preventDefault()

  var selectedFolderIds = []
  for (let option of DOM.selectFolders.selectedOptions) {
    selectedFolderIds.push(option.value)
  }
  
  browser.storage.local.set({
    'selectedFolderIds': selectedFolderIds
  })
})