import { useCallback } from 'react';
import type { FilterItem } from '../../../components/filterChat/Index';
import { useCursorScroll } from '../../../hooks/useCursorScroll';
import type { DepartmentResponse, SystemResponse } from '../types/chat.types';

export function useChatFilterOptions() {
  const { fetchPage: fetchDepartmentsPage } = useCursorScroll<DepartmentResponse>({
    endpoint: '/department/scrolling',
    cursorParam: 'departmentId',
    getCursor: (department) => department.departmentId,
  });
  const { fetchPage: fetchSystemsPage } = useCursorScroll<SystemResponse>({
    endpoint: '/systems/scrolling',
    cursorParam: 'systemId',
    getCursor: (system) => system.systemId,
  });

  const fetchDepartments = useCallback(async (lastIdDepartment?: number) => {
    const response = await fetchDepartmentsPage(lastIdDepartment);
    const data = response.data.map((department): FilterItem => ({
      itemId: department.departmentId,
      itemNm: department.departmentNm,
    }));

    return { data, finish: response.finish };
  }, [fetchDepartmentsPage]);

  const fetchSystems = useCallback(async (lastIdSystem?: number) => {
    const response = await fetchSystemsPage(lastIdSystem);
    const data = response.data.map((system): FilterItem => ({
      itemId: system.systemId,
      itemNm: system.systemNm,
    }));

    return { data, finish: response.finish };
  }, [fetchSystemsPage]);

  return { fetchDepartments, fetchSystems };
}
