/** @type {{ Text: Text, document: Document }} */
export var {
	Text = class {
		constructor(data = '') {
			this.data = this.textContent = data
			this.isConnected = false
			this.childNodes = new Set()
		}
		// eslint-disable-next-line getter-return
		get firstChild() {
			for (var childNode of this.childNodes) {
				return childNode
			}
		}
		appendChild(node) {
			node.parentNode = this
			node.isConnected = true
			this.childNodes.add(node)
			return node
		}
		querySelector() {}
		replaceChildren() {
			for (var childNode of this.childNodes) {
				childNode.isConnected = false
				this.childNodes.delete(childNode)
			}
		}
		remove() {
			this.isConnected = false
			this.parentNode.childNodes.delete(this)
		}
	},
	document = {
		createElement() {
			return new Text()
		},
		head: new Text(),
	},
} = globalThis // eslint-disable-line no-undef
