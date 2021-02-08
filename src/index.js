import "./style.scss";
import $ from "jquery";
import semantic from "semantic-ui-css";

$("#dropdown").dropdown();

$(function () {
  $("#multi-select").dropdown();
});

const events = Object.entries(localStorage).map((i) => JSON.parse(i[1]));

(function (arrOfEvents) {
  const objOfEvents = arrOfEvents.reduce((acc, event) => {
    acc[event._id] = event;
    return acc;
  }, {});

  const form = document.forms.addEvent;
  if (form) {
    const inputEventName = form.elements.eventName;
    const selectDay = form.elements.day;
    const selectTime = form.elements.time;
    const inputBody = form.elements.body;
    form.addEventListener("submit", onFormSubmitHandler);

    function onFormSubmitHandler(e) {
      e.preventDefault();
      const eventNameValue = inputEventName.value;
      const participantsValue = [];
      const dayValue = selectDay.value;
      const timeValue = selectTime.value;
      const participants = document.querySelectorAll(
        ".ui.label.transition.visible"
      );

      for (let i = 0; i < participants.length; i++) {
        participantsValue.push(participants[i].dataset.value);
      }

      if (!timeValue || !dayValue || !eventNameValue || !participantsValue.length) {
        alert("Fill all the fields please");
        return;
      }

      let failedEvent = Object.values(objOfEvents).some((ev) => {
        return timeValue == ev.time && dayValue == ev.day;
      });

      if (failedEvent) {
        alert("Failed to create an event. Time slot is already booked.");
        return;
      }

      createNewEvent(eventNameValue, participantsValue, dayValue, timeValue);

      form.reset();

      window.location.href = "index.html";
    }

    function createNewEvent(eventName, participants, day, time) {
      const newEvent = {
        _id: `event_${Math.random()}`,
        eventName,
        participants,
        day,
        time,
      };

      objOfEvents[newEvent._id] = newEvent;
      localStorage.setItem(newEvent._id, JSON.stringify(newEvent));

      return { ...newEvent };
    }
  } else {
    renderAllEvents(objOfEvents);

    function renderAllEvents(eventsList) {
      Object.values(eventsList).forEach((event) => {
        const div = document.querySelector(`.${event.time}.${event.day}`);
        div.innerHTML = `${event.eventName} <img src="src/x.svg" class="delete-icon">`;
        div.classList.add('booked')
        div.setAttribute('data-task-id', event._id);
      });
    }

    function hideAllEvents(eventsList) {
      Object.values(eventsList).forEach((event) => {
        const div = document.querySelector(`.${event.time}.${event.day}`);
        div.innerHTML = "";
        div.classList.remove('booked')
      });
    }

    const selectedParticipant = document.querySelector("#selectMember");
    selectedParticipant.addEventListener("change", filterEvents);

    function filterEvents() {
      if (selectedParticipant.value === "all-members") {
        renderAllEvents(objOfEvents);
      } else {
        const filteredArr = Object.values(objOfEvents).filter((el) => {
          if (el.participants.includes(selectedParticipant.value)) {
            return el;
          }
        });

        const filteredObj = filteredArr.reduce(function (result, item) {
          let key = Object.values(item)[0];
          result[key] = item;
          return result;
        }, {});

        hideAllEvents(objOfEvents);
        renderAllEvents(filteredObj);
      }
    }

    const table = document.querySelector('.main-section');
    table.addEventListener('click', onDeleteHandler);

    function onDeleteHandler({ target }) {
      if (target.classList.contains('delete-icon')) {
        const parent = target.closest('[data-task-id]')
        const id = parent.dataset.taskId;
        const confirmed = deleteEvent(id);
        const divContent = parent
        deleteEventFromHtml(confirmed, divContent);
      }
    }

    function deleteEvent(id) {
      const { eventName } = objOfEvents[id];
      const isConfirm = confirm(`Are you sure you want to delete '${eventName}' event?`)
      if (!isConfirm) return isConfirm;
      delete objOfEvents[id];
      localStorage.removeItem(id)

      return isConfirm;
    }

    function deleteEventFromHtml(confirmed, el) {
      if (!confirmed) return;
      el.innerHTML = ''
      el.classList.remove('booked')
    }
  }
})(events);
