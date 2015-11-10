function LoginPage() {
    this.login_button = element(by.id('submit_login'));
    this.username_field = element(by.id('Username'));
    this.password_field = element(by.id('Password'));

    this.forgot_link = element(by.id('forgot_password'));
    this.email = element(by.id('Email'));
    this.submit_email = element(by.id('email_submit'));
    this.back_to_login = element(by.id('back_to_login'));

    this.get = function() {
        browser.get('#/login');
    };

    this.login = function() {
        this.login_button.click();
    };

    this.forgot = function() {
        this.forgot_link.click();
    };

    this.sendEmail = function() {
        this.submit_email.click();
    };

    this.back = function() {
        this.back_to_login.click();
    };
}

describe('login page', function() {
    var page = new LoginPage();

    beforeEach(function() {
        page.get();
    });

    describe('login', function() {

    });

    describe('forgot password', function() {
        beforeEach(function() {
            page.forgot();
        });

        it ('should change the form', function() {
            page.email.sendKeys('cobrien@four51.com');
        });

        it ('should display a message', function() {
            page.email.sendKeys('cobrien@four51.com');
            page.sendEmail();
        });

        //it ('should go back to login', function() {
        //    page.reset();
        //})
    });
});