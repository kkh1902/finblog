from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'per_page'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'page': self.page.number,
                'pages': self.page.paginator.num_pages,
                'per_page': self.page_size,
                'total': self.page.paginator.count,
                'has_next': self.page.has_next(),
                'has_prev': self.page.has_previous(),
            },
            'results': data
        })