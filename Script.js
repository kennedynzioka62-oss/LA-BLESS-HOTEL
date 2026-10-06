const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');

menuToggle.addEventListener('click', () => {
	const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
	menuToggle.setAttribute('aria-expanded', String(!isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
	primaryNav.classList.toggle('is-open', !isOpen);
});

primaryNav.querySelectorAll('a').forEach((link) => {
	link.addEventListener('click', () => {
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Open navigation');
		primaryNav.classList.remove('is-open');
	});
});

const dateInputs = [
	document.querySelector('#quick-checkin'),
	document.querySelector('#quick-checkout'),
	document.querySelector('[name="checkin"]'),
	document.querySelector('[name="checkout"]')
];
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
const todayString = today.toISOString().slice(0, 10);
dateInputs.forEach((input) => { input.min = todayString; });

function setCheckoutMinimum(checkin, checkout) {
	checkout.min = checkin.value || todayString;
	checkout.setCustomValidity('');
	if (checkout.value && checkout.value <= checkin.value) checkout.value = '';
}

document.querySelectorAll('#quick-checkin, [name="checkin"]').forEach((checkin) => {
	const checkout = checkin.id === 'quick-checkin'
		? document.querySelector('#quick-checkout')
		: document.querySelector('[name="checkout"]');
	checkin.addEventListener('change', () => setCheckoutMinimum(checkin, checkout));
});

document.querySelectorAll('[data-room-select]').forEach((link) => {
	link.addEventListener('click', () => {
		document.querySelector('[name="room"]').value = link.dataset.roomSelect;
	});
});

document.querySelector('#availability-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const checkin = document.querySelector('#quick-checkin');
	const checkout = document.querySelector('#quick-checkout');
	checkin.setCustomValidity('');
	checkout.setCustomValidity('');
	if (!checkin.value) {
		checkin.setCustomValidity('Choose a check-in date.');
		checkin.reportValidity();
		return;
	}
	if (!checkout.value || checkout.value <= checkin.value) {
		checkout.setCustomValidity('Choose a check-out date after check-in.');
		checkout.reportValidity();
		return;
	}
	document.querySelector('[name="checkin"]').value = checkin.value;
	document.querySelector('[name="checkout"]').value = checkout.value;
	document.querySelector('[name="guests"]').value = `${document.querySelector('#quick-guests').value} ${document.querySelector('#quick-guests').value === '1' ? 'guest' : 'guests'}`;
	document.querySelector('#booking').scrollIntoView({ behavior: 'smooth' });
	document.querySelector('[name="name"]').focus({ preventScroll: true });
});

document.querySelector('#reservation-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = event.currentTarget;
	const message = document.querySelector('#form-message');
	const requiredFields = [...form.querySelectorAll('[required]')];
	requiredFields.forEach((field) => field.removeAttribute('aria-invalid'));
	const invalid = requiredFields.filter((field) => !field.value.trim() || !field.checkValidity());
	const checkin = form.elements.checkin;
	const checkout = form.elements.checkout;
	if (checkin.value && checkout.value && checkout.value <= checkin.value) {
		checkout.setCustomValidity('Check-out must be after check-in.');
		invalid.push(checkout);
	} else {
		checkout.setCustomValidity('');
	}
	if (invalid.length) {
		invalid.forEach((field) => field.setAttribute('aria-invalid', 'true'));
		message.textContent = invalid.includes(checkout) && checkout.validationMessage
			? checkout.validationMessage
			: 'Please complete the required fields with valid details.';
		message.className = 'form-message is-error';
		invalid[0].focus();
		return;
	}
	message.textContent = `Thank you, ${form.elements.name.value.trim()}. Your enquiry is ready; our reservations team will be in touch shortly.`;
	message.className = 'form-message is-success';
	form.reset();
});

const reviews = [
	{ quote: '“The rare hotel that makes a busy trip feel like a proper break. Every detail felt personal, and the team remembered my coffee order by day two.”', author: 'Tomi A.', location: 'Mombasa, Kenya' },
	{ quote: '“Warm, thoughtful service from the first hello. ORÍ alone is worth the stay, and the room was a wonderfully quiet place to come back to.”', author: 'Chinedu O.', location: 'London, UK' },
	{ quote: '“A genuinely lovely base for a week in Nairobi. The team made everything easy, from the airport pickup to one last perfect breakfast.”', author: 'Amaka E.', location: 'Kampala, Uganda' }
];
let reviewIndex = 0;
function showReview(index) {
	reviewIndex = (index + reviews.length) % reviews.length;
	const review = reviews[reviewIndex];
	document.querySelector('#review-quote').textContent = review.quote;
	document.querySelector('#review-author').innerHTML = `${review.author} <span>· ${review.location}</span>`;
	document.querySelector('#review-count').innerHTML = `0${reviewIndex + 1} <i>/</i> 0${reviews.length}`;
}
document.querySelector('#review-prev').addEventListener('click', () => showReview(reviewIndex - 1));
document.querySelector('#review-next').addEventListener('click', () => showReview(reviewIndex + 1));

const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
document.querySelectorAll('[data-gallery-src]').forEach((item) => {
	item.addEventListener('click', () => {
		lightboxImage.src = item.dataset.gallerySrc;
		lightboxImage.alt = item.querySelector('img').alt;
		lightbox.showModal();
		document.body.classList.add('no-scroll');
	});
});
function closeLightbox() {
	lightbox.close();
	document.body.classList.remove('no-scroll');
}
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
	if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener('close', () => document.body.classList.remove('no-scroll'));

document.querySelector('#current-year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12 });
	document.querySelectorAll('.about-main, .about-photo, .room-card, .experience-content, .dining-copy, .dining-visual, .gallery-item, .booking-copy, .reservation-form, .contact-details').forEach((element) => {
		element.setAttribute('data-reveal', '');
		revealObserver.observe(element);
	});
} else {
	document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
}
