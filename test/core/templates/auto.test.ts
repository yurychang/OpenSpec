import { describe, expect, it } from 'vitest';
import { CORE_WORKFLOWS } from '../../../src/core/profiles.js';
import { getSkillTemplates, getCommandContents } from '../../../src/core/shared/skill-generation.js';
import { getSkillReferenceTransformer, transformCommandInvocations } from '../../../src/utils/command-references.js';

describe('auto workflow distribution and boundaries', () => {
  it('ships the same workflow through both default delivery surfaces', () => {
    const skill = getSkillTemplates(CORE_WORKFLOWS).find(entry => entry.workflowId === 'auto');
    const command = getCommandContents(CORE_WORKFLOWS).find(entry => entry.id === 'auto');
    expect(skill?.dirName).toBe('openspec-auto');
    expect(command?.body).toBe(skill?.template.instructions);
    expect(command?.body).toContain('Exploration has no persisted CLI completion flag');
    expect(command?.body).toContain('If exploration is unfinished, explain and stop');
    expect(command?.body).toContain('Do not create a change, fill in artifacts, implement code');
    expect(command?.body).toContain('Do not wait for another user request');
    expect(command?.body).toContain('Do not invoke the standalone propose workflow');
    expect(command?.body).toContain('Never auto-select this workflow');
    expect(command?.body).toContain('do not sync, archive, commit, push, or publish automatically');
  });

  it('works in an auto-only custom profile without depending on absent skills', () => {
    const [{ template }] = getSkillTemplates(['auto']);
    expect(template.instructions).toContain('openspec instructions <artifact-id>');
    expect(template.instructions).toContain('openspec instructions apply');
    expect(template.instructions).toContain('sourcePath');
    expect(template.instructions).not.toMatch(/\/opsx:(propose|apply|continue|archive)/);
  });

  it('spells auto correctly for command and skill integrations', () => {
    expect(getSkillReferenceTransformer('codex')('/opsx:auto add-auth')).toBe('$openspec-auto add-auth');
    expect(getSkillReferenceTransformer('kimi')('/opsx:auto')).toBe('/skill:openspec-auto');
    expect(transformCommandInvocations('/opsx:auto', { style: 'flat', prefix: '/' })).toBe('/opsx-auto');
    expect(transformCommandInvocations('/opsx:auto', { style: 'flat', prefix: '@' })).toBe('@opsx-auto');
  });
});
