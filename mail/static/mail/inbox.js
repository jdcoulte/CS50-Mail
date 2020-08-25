document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Event listener for send email button
  document.querySelector('#submit-button').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 class="mb-2 pb-2">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  headerdiv = document.createElement("div");
  headerdiv.className += "border-bottom font-weight-bold container-fluid row";
  headerdiv.innerHTML = `<div class="col-3 px-2 pt-2">
                          <p>Sender</p>
                         </div>
                         <div class="col-6 px-2 pt-2">
                          <p>Subject</p>
                         </div>
                         <div class="col-3 px-2 pt-2">
                          <p>Sent On</p>
                         </div>`;

  document.querySelector("#emails-view").appendChild(headerdiv);  

  let url = "/emails/" + mailbox;
  fetch(url)
.then(response => response.json())
.then(emails => {
    if(emails.length === 0) {
      emaildiv = document.createElement("div");
      emaildiv.className += "container-fluid row";
      emaildiv.innerHTML = `<div class="col-3 pt-2">
                              <p>No emails found</p>
                            </div>
                            <div class="col-6 pt-2">
                              <p></p>
                            </div>
                            <div class="col-3 pt-2">
                              <p></p>
                            </div>`;

      document.querySelector("#emails-view").appendChild(emaildiv);  
    }
    else {
      emails.forEach(email => display_email(email));
      // for(let i = 0, len = emails.length; i < len; i++) {
      //   // format each email and append it to the #emails-view node
      //   display_email(emails[i]);
      // }
    }    
});

}

// Send an email when submit button is clicked on compose email field. Display error if error returned.
function send_email() {
  let recipientsvalue = document.querySelector('#compose-recipients').value;
  let subjectvalue = document.querySelector('#compose-subject').value;
  let bodyvalue = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipientsvalue,
        subject: subjectvalue,
        body: bodyvalue
    })
  })
  .then(response => response.json())
  .then(result => {
      if(!result['error']) {
        load_mailbox('sent');
      }
      else {
        if(document.querySelector('#errorp')) {
          let oldp = document.querySelector('#errorp');
          let parent = document.querySelector("#compose-view");
          parent.removeChild(oldp);
        }
        let newp = document.createElement("p");
        newp.setAttribute("id", "errorp");
        let error = document.createTextNode(`${result['error']}`);
        newp.appendChild(error);
        newp.style.color = "red";
        document.querySelector('#compose-view').prepend(newp);
        return false;
      }
  });
};

function display_email(email) {
  const emaildiv = document.createElement("div");
  emaildiv.className += "border-top border-bottom container-fluid row email";
  emaildiv.addEventListener('click', () => read_email(email['id']));

  if(email['subject'] === '') {
    subject = "[No Subject]";
  }
  else {
    subject = email['subject'];
  }

  if(email['read'] === false) {
    p_element = "<p class='font-weight-bold'>";
  }
  else {
    p_element = "<p>";
    emaildiv.className += " bg-light";
  }

  emaildiv.innerHTML = `<div class="col-3 p-0 mt-3">
                          ${p_element}${email['sender']}</p>
                        </div>
                        <div class="col-6 p-0 mt-3">
                          ${p_element}${subject}</p>
                        </div>
                        <div class="col-3 p-0 mt-3">
                          ${p_element}${email['timestamp']}</p>
                        </div>`;

  document.querySelector("#emails-view").appendChild(emaildiv);
};

function read_email(id) {
  // Show the email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Empty the email view
  const myNode = document.querySelector('#email-view');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }


  let url = '/emails/' + id;
  fetch(url)
.then(response => response.json())
.then(email => {
      const emailView = document.querySelector("#email-view");
      const headerdiv = document.createElement("div");
      headerdiv.className += "container-fluid row";
      headerdiv.innerHTML = `<div class="col-3 m-0 py-2">
                                <p class="my-2 p-0"><strong>From:</strong></p>
                                <p class="my-2 p-0"><strong>To:</strong></p>
                                <p class="my-2 p-0"><strong>Subject:</strong></p>
                                <p class="my-2 p-0"><strong>Timestamp:</strong></p>
                            </div>
                            <div class="col-9 m-0 p-0">
                              <p class="my-2 p-0">${email['sender']}&nbsp;</p>
                              <p class="my-2 p-0">${email['recipients']}&nbsp;</p>
                              <p class="my-2 p-0">${email['subject']}&nbsp;</p>
                              <p class="my-2 p-0">${email['timestamp']}&nbsp;</p>
                            </div>`
      const archive_button = document.createElement("button");
      archive_button.className += "btn btn-sm btn-outline-primary mx-3 py-2";

      if(email['archived'] === false) {
        archive_button.innerHTML = "Archive";
        archive_button.addEventListener('click', () => archive(email['id']));
      }
      else {
        archive_button.innerHTML = "Restore";
        archive_button.addEventListener('click', () => restore(email['id']));
      }

      const reply_button = document.createElement("button");
      reply_button.className += "btn btn-sm btn-outline-primary py-2";
      reply_button.innerHTML = "Reply";
      reply_button.addEventListener('click', () => reply(email['sender'], email['subject'], email['timestamp'], email['body']));

      const divider = document.createElement("hr");

      const bodydiv = document.createElement("div");
      bodydiv.innerHTML = `<p class="ml-1 p-2">${email['body']}</p>`

      emailView.appendChild(headerdiv);
      emailView.appendChild(archive_button);
      emailView.appendChild(reply_button);
      emailView.appendChild(divider);
      emailView.appendChild(bodydiv);
      
    });

    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
    return false;
}

function archive(id) {
  let url = '/emails/' + id;
  fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  window.location.href = "/";
}

function restore(id) {
  let url = '/emails/' + id;
  fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  window.location.href = "/";
}

function reply(recipient, subject, timestamp, body) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Create the correct format for the new fields
  let newsubject = '';
  if (subject.substring(0, 3).toLowerCase() === 're:') {
    newsubject = subject;
  }
  else {
    newsubject = "Re: " + subject;
  }

  let newbody = `\n------------------------\nOn ${timestamp} ${recipient} wrote:\n\n${body}`

  // Pre-fill fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = newsubject;
  document.querySelector('#compose-body').value = newbody;
}