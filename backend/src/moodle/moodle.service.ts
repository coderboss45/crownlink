import { Injectable, Logger } from "@nestjs/common";
import fetch from "node-fetch";

@Injectable()
export class MoodleService {
  private logger = new Logger(MoodleService.name);

  private cfg() {
    const base = process.env.MOODLE_BASE_URL;
    const token = process.env.MOODLE_TOKEN;
    if (!base || !token) return null;
    return { base, token } as const;
  }

  async createUser(
    username: string,
    password: string,
    email: string,
    firstname = "Learner",
    lastname = "",
  ) {
    const cfg = this.cfg();
    if (!cfg) {
      this.logger.warn("Moodle not configured, skipping user creation");
      return null;
    }
    const url = new URL("/webservice/rest/server.php", cfg.base);
    url.searchParams.set("wstoken", cfg.token);
    url.searchParams.set("wsfunction", "core_user_create_users");
    url.searchParams.set("moodlewsrestformat", "json");
    const body = new URLSearchParams();
    body.append("users[0][username]", username);
    body.append("users[0][password]", password);
    body.append("users[0][email]", email);
    body.append("users[0][firstname]", firstname);
    body.append("users[0][lastname]", lastname);
    const res = await fetch(url.toString(), { method: "POST", body });
    if (!res.ok) throw new Error("Moodle create user failed");
    return res.json();
  }

  async getUserByField(field: string, value: string) {
    const cfg = this.cfg();
    if (!cfg) return null;
    const url = new URL('/webservice/rest/server.php', cfg.base);
    url.searchParams.set('wstoken', cfg.token);
    url.searchParams.set('wsfunction', 'core_user_get_users_by_field');
    url.searchParams.set('moodlewsrestformat', 'json');
    const body = new URLSearchParams();
    body.append('field', field);
    body.append('values[0]', value);
    const res = await fetch(url.toString(), { method: 'POST', body });
    if (!res.ok) throw new Error('Moodle get user failed');
    return res.json();
  }

  async updateUser(user: { id: number; firstname?: string; lastname?: string; email?: string; username?: string; }) {
    const cfg = this.cfg();
    if (!cfg) return null;
    const url = new URL('/webservice/rest/server.php', cfg.base);
    url.searchParams.set('wstoken', cfg.token);
    url.searchParams.set('wsfunction', 'core_user_update_users');
    url.searchParams.set('moodlewsrestformat', 'json');
    const body = new URLSearchParams();
    body.append('users[0][id]', String(user.id));
    if (user.firstname) body.append('users[0][firstname]', user.firstname);
    if (user.lastname) body.append('users[0][lastname]', user.lastname);
    if (user.email) body.append('users[0][email]', user.email);
    if (user.username) body.append('users[0][username]', user.username);
    const res = await fetch(url.toString(), { method: 'POST', body });
    if (!res.ok) throw new Error('Moodle update user failed');
    return res.json();
  }

  async enrolUser(userId: number, courseId: number, roleId = 5) {
    const cfg = this.cfg(); if (!cfg) return null;
    const url = new URL('/webservice/rest/server.php', cfg.base);
    url.searchParams.set('wstoken', cfg.token);
    url.searchParams.set('wsfunction', 'enrol_manual_enrol_users');
    url.searchParams.set('moodlewsrestformat', 'json');
    const body = new URLSearchParams();
    body.append('enrolments[0][roleid]', String(roleId));
    body.append('enrolments[0][userid]', String(userId));
    body.append('enrolments[0][courseid]', String(courseId));
    const res = await fetch(url.toString(), { method: 'POST', body });
    if (!res.ok) throw new Error('Moodle enrol user failed');
    return res.json();
  }

  async createOrUpdateUserByEmail({ username, password, email, firstname, lastname, role }: { username: string; password: string; email: string; firstname?: string; lastname?: string; role?: string }) {
    const found = await this.getUserByField('email', email);
    if (Array.isArray(found) && found.length > 0) {
      // update existing
      const id = found[0].id;
      return await this.updateUser({ id, firstname, lastname, username, email });
    } else {
      // create
      return await this.createUser(username, password, email, firstname, lastname);
    }
  }

  async createCourse(fullname: string, shortname: string, categoryid?: number) {
    const cfg = this.cfg();
    if (!cfg) return null;
    const url = new URL('/webservice/rest/server.php', cfg.base);
    url.searchParams.set('wstoken', cfg.token);
    url.searchParams.set('wsfunction', 'core_course_create_courses');
    url.searchParams.set('moodlewsrestformat', 'json');
    const body = new URLSearchParams();
    body.append('courses[0][fullname]', fullname);
    body.append('courses[0][shortname]', shortname);
    if (categoryid) body.append('courses[0][categoryid]', String(categoryid));
    const res = await fetch(url.toString(), { method: 'POST', body });
    if (!res.ok) throw new Error('Moodle create course failed');
    return res.json();
  }

  async getCourseCompletionStatus(moodleUserId: number, moodleCourseId: number) {
    const cfg = this.cfg();
    if (!cfg) return null;
    const url = new URL('/webservice/rest/server.php', cfg.base);
    url.searchParams.set('wstoken', cfg.token);
    url.searchParams.set('wsfunction', 'core_completion_get_course_completion_status');
    url.searchParams.set('moodlewsrestformat', 'json');
    const body = new URLSearchParams();
    body.append('courseid', String(moodleCourseId));
    body.append('userid', String(moodleUserId));
    const res = await fetch(url.toString(), { method: 'POST', body });
    if (!res.ok) throw new Error('Moodle get completion failed');
    const json = await res.json();
    // Expected: { completionstatus: { completed: boolean, ... } }
    try {
      return !!json?.completionstatus?.completed;
    } catch {
      return null;
    }
  }
}
