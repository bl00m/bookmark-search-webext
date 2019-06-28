class FolderTreeNode {
  constructor(id, title, isSelected, parent=null) {
    this.id = id
    this.title = title
    this.isSelected = isSelected
    this.parent = parent
    this.children = []
  }

  getChildById(id) {
    let found = null

    if (this.id == id) {
      return this
    }

    let idx = 0
    let children = this.children.slice()
    while (found == null && idx < children.length) {
      if (children[idx].id == id) {
        found = children[idx]
      }

      children[idx].children.forEach(child => {
        children.push(child)
      })

      idx++
    }

    return found
  }

  getFamilyIds() {
    let family = []

    let parent = this.parent
    while (parent != null) {
      family.push(parent.id)
      parent = parent.parent
    }

    let idx = 0
    let children = this.children.slice()
    while (idx < children.length) {
      family.push(children[idx].id)
      children[idx].children.forEach(child => {
        children.push(child)
      })
      idx++
    }

    return family
  }

  isSearchable() {
    if (this.isSelected) {
      return true
    }

    if (this.parent != null) {
      return this.parent.isSearchable()
    }

    return false
  }

  static buildFromBookmarksTreeNode(bookmarksTreeNode, selectedFolderIds, parent=null) {
    const node = new FolderTreeNode(
      bookmarksTreeNode.id,
      bookmarksTreeNode.title,
      (parent == null && selectedFolderIds.length == 0) || (selectedFolderIds.indexOf(bookmarksTreeNode.id) != -1),
      parent
    )

    bookmarksTreeNode.children.forEach(bookmarksTreeChild => {
      if (typeof bookmarksTreeChild.url === 'undefined') {
        node.children.push(this.buildFromBookmarksTreeNode(bookmarksTreeChild, selectedFolderIds, node))
      }
    })
    
    return node
  }
}

async function loadConfig(defaultConfig) {
  const storage = await browser.storage.local.get(Object.getOwnPropertyNames(defaultConfig))
  return {...defaultConfig, ...storage}
}