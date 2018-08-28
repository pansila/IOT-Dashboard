<style>
@keyframes resizeSensorVisibility {
  from { top: 0; }
}
</style>

<script>
'use strict'
export default {
  // thanks to https://github.com/marcj/css-element-queries
  props: {
    initial: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      size: {
        width: -1,
        height: -1
      }
    }
  },
  methods: {
    reset () {
      var expand = this.$el.firstChild
      var shrink = this.$el.lastChild
      expand.scrollLeft = 100000
      expand.scrollTop = 100000
      shrink.scrollLeft = 100000
      shrink.scrollTop = 100000
    },
    update () {
      this.size.width = this.$el.offsetWidth
      this.size.height = this.$el.offsetHeight
    }
  },
  watch: {
    size: {
      deep: true,
      handler (size) {
        this.reset()
        this.$emit('resize', { width: this.size.width, height: this.size.height })
      }
    }
  },
  render (create) {
    var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;'
    var styleChild = 'position: absolute; left: 0; top: 0;'
    return create('div', {
      style: style + 'animation-name: resizeSensorVisibility;',
      on: {
        '~animationstart': this.update
      }
    },
    [
      create('div', {
        style: style,
        on: {
          scroll: this.update
        }
      },
      [
        create('div', {
          style: styleChild + 'width: 100000px; height: 100000px;'
        })
      ]),
      create('div', {
        style: style,
        on: {
          scroll: this.update
        }
      },
      [
        create('div', {
          style: styleChild + 'width: 200%; height: 200%;'
        })
      ])
    ])
  },
  beforeDestroy () {
    this.$emit('resize', { width: 0, height: 0 })
    this.$emit('resizeSensorBeforeDestroy')
  },
  mounted () {
    if (this.initial === true) {
      this.$nextTick(this.update)
    }

    if (this.$el.offsetParent !== this.$el.parentNode) {
      this.$el.parentNode.style.position = 'relative'
    }
    if ('attachEvent' in this.$el && !('AnimationEvent' in window)) {
      var onresizeHandler = () => {
        this.update()
        removeOnresizeEvent()
      }

      var removeOnresizeEvent = () => {
        this.$el.detachEvent('onresize', onresizeHandler)
        this.$off('resizeSensorBeforeDestroy', removeOnresizeEvent)
      }

      this.$el.attachEvent('onresize', onresizeHandler)
      this.$on('resizeSensorBeforeDestroy', removeOnresizeEvent)
      this.reset()
    }
  }
}
</script>