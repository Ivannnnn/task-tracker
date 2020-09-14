import { padZero } from 'utils'
import { on, off, State } from './utils'

export default function durationPicker($el, emitEvent) {
  const CONFIG = {
    increment: {
      hours: 1,
      minutes: 5,
    },
  }

  const [hours, minutes] = $el.value ? $el.value.split(':').map(Number) : [0, 0]

  const [state, updateState, watchState] = new State({
    hours,
    minutes,
    selected: null,
  })

  function stateChange() {
    view.updateValue()
    emitEvent.onChange(getTime())
  }

  watchState({
    hours: stateChange,
    minutes: stateChange,
    selected: (selected) => view.select(selected),
  })

  const actions = {
    increment(what) {
      if (what === 'hours') {
        const newHours = state.hours + CONFIG.increment.hours
        newHours <= 99
          ? updateState({ hours: newHours })
          : updateState({ hours: 0 })
      } else if (what === 'minutes') {
        const newMinutes = state.minutes + CONFIG.increment.minutes
        newMinutes < 60
          ? updateState({ minutes: newMinutes })
          : updateState({ minutes: 0 })
      }
    },

    decrement(what) {
      if (what === 'minutes') {
        const newMinutes = state.minutes - CONFIG.increment.minutes
        newMinutes >= 0
          ? updateState({ minutes: newMinutes })
          : updateState({ minutes: 60 + newMinutes })
      } else if (what === 'hours') {
        const newHours = state.hours - CONFIG.increment.hours
        newHours >= 0
          ? updateState({ hours: newHours })
          : updateState({ hours: 99 })
      }
    },

    switchSelected() {
      updateState({
        selected: state.selected === 'hours' ? 'minutes' : 'hours',
      })
    },
  }

  const getTime = () =>
    `${padZero(state.hours, 2)}:${padZero(state.minutes, 2)}`

  const view = {
    updateValue() {
      const [start, end] = [$el.selectionStart, $el.selectionEnd]
      $el.value = `${getTime()}`
      $el.setSelectionRange(start, end)
    },

    select(what) {
      const strategy = {
        minutes: () =>
          $el.setSelectionRange($el.value.indexOf(':') + 1, $el.value.length),
        hours: () => $el.setSelectionRange(0, $el.value.indexOf(':')),
      }[what]

      setTimeout(strategy)
    },

    registerEvents() {
      const click = () => events.click()
      const blur = () => events.blur()

      function keydown(e) {
        e.preventDefault()
        const proxy = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          Tab: 'tab',
        }

        proxy[e.key]
          ? events[proxy[e.key]](e.key)
          : !isNaN(e.key) && events.numPress(e.key)
      }

      function wheel(e) {
        if (state.selected) {
          e.wheelDelta > 0 ? events.wheelUp() : events.wheelDown()
        }
      }

      on($el, { click, keydown, blur })
      on(window, { wheel })

      return () => {
        off($el, { click, keydown, blur })
        off(window, { wheel })
      }
    },
  }

  const events = {
    click: () => {
      setTimeout(() => {
        const selected =
          $el.selectionStart > $el.value.indexOf(':') ? 'minutes' : 'hours'
        updateState({ selected })
        view.select(selected)
      })
    },
    blur: () => updateState({ selected: null }),
    up: () => actions.increment(state.selected),
    down: () => actions.decrement(state.selected),
    tab: () => actions.switchSelected(),
    numPress: (number) => {
      const last2Digits = (val) => val.slice(-2)

      const strategy = {
        hours: () => {
          updateState({ hours: Number(last2Digits(state.hours + number)) })
        },
        minutes: () => {
          const newMinutes = Number(last2Digits(state.minutes + number), 2)
          newMinutes <= 60
            ? updateState({ minutes: newMinutes })
            : updateState({ minutes: '0' + String(newMinutes)[1] })
        },
      }[state.selected]()
    },
    wheelUp: () => actions.increment(state.selected),
    wheelDown: () => actions.decrement(state.selected),
  }

  const unregisterEvents = view.registerEvents()

  function destroy() {
    unregisterEvents()
  }

  return destroy
}
